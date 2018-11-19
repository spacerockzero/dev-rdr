// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
// app libs
const {processFlow, scrapeUrl} = require('./lib/feeds');
const {updateArticles} = require('./lib/update');
const {makeArticle} = require('./lib/article');
const {getSentiment} = require('./lib/sentiment');
const sources = require('./lib/sources');

const defaultLimit = 25;
const defaultSort = 'desc';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const settings = {
  timestampsInSnapshots: true
};
db.settings(settings);

// methods

// get articles method for UI
const getArticlesHandler = async (limit = defaultLimit, after, sort = defaultSort) => {
  // TODO: limit, page, sort
  try {
    let snapshot;
    if (after) {
      // pagination
      const date = new Date(after);
      snapshot = await db
        .collection('publicArticles')
        .limit(limit)
        .orderBy('createdOn', sort)
        .startAfter(date)
        .get();
    } else {
      // first load
      snapshot = await db
        .collection('publicArticles')
        .orderBy('createdOn', sort)
        .limit(limit)
        .get();
    }

    const articles = [];
    snapshot.forEach(doc => {
      const document = doc.data();
      const timestamp = document.createdOn;
      document.createdOn = timestamp.toMillis();
      articles.push(document);
    });
    return articles;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update feeds and add new uniques to firestore
const updateArticlesHandler = () => {
  return processFlow(sources)
    .then(content => {
      return content.map(item => {
        return makeArticle({
          title: item.title,
          link: item.link,
          feedsrc: item.feedsrc,
          labels: item.labels
        });
      });
    })
    .then(articles => {
      console.log('before save: articles.length:', articles.length);
      return saveArticles(articles)
        .then(results => {
          return results;
        })
        .catch(error => {
          console.error('Save articles error:', error);
        });
    });
};

// save new articles to db
const saveArticles = articles => {
  const collectionRef = db.collection('rawArticles');
  const batch = db.batch();
  articles.forEach(article => {
    const ref = collectionRef.doc(article.id);
    batch.set(ref, article);
  });
  return batch.commit();
};

// endpoints

// send new articles to UI client
exports.getArticles = functions.https.onRequest((req, res) => {
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }
  return cors(req, res, () => {
    // TODO: limit, page, sort
    const limit = parseInt(req.query.limit) || defaultLimit;
    const after = parseInt(req.query.after) || null;
    const sort = req.query.sort || defaultSort;
    console.log('limit:', limit);
    console.log('after:', after);
    console.log('sort:', sort);
    console.log(' ');
    return getArticlesHandler(limit, after, sort)
      .then(result => res.status(200).send(result))
      .catch(error => {
        console.error('getArticles endpoint err:', error);
        return res.status(500).send(error);
      });
  });
});

exports.updateArticles = functions.https.onRequest((req, res) => {
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }
  return cors(req, res, async () => {
    let result;
    let status;
    try {
      result = await updateArticlesHandler();
      status = 200;
    } catch (err) {
      result = err;
      status = 500;
      console.error('updatefeed endpoint err:', err);
    }
    return res.status(status).send(result);
  });
});

// When new docs are saved, go get their metadata for thumbnails and whatnot
exports.getMeta = functions.firestore.document('rawArticles/{articleId}').onCreate((snap, context) => {
  const doc = snap.data();
  console.log('doc:', doc);
  console.log('doc.link:', doc.link);
  if (doc.link) {
    return scrapeUrl(doc.link)
      .then(metadata => {
        console.log('metadata:', metadata);
        console.log('metadata.image', metadata.image);
        if (metadata) {
          const newDoc = doc;
          // set opengraph + image
          newDoc.opengraph = {
            image: metadata.image || null,
            title: doc.title || null,
            description: metadata.description || null,
            url: doc.link
          };
          // get positivity score
          newDoc.sentiment = {
            score: getSentiment(newDoc).score
          };
          console.log('newDoc', newDoc);
          // finally, save it to public
          return db
            .collection('publicArticles')
            .doc(doc.id)
            .set(newDoc)
            .then(result => {
              console.log('doc.id', doc.id);
              console.log('newDoc:', newDoc);
              console.log('db write result:', result);
              return result;
            })
            .catch(error => console.error('Error writing metadata to db:', error));
        }
        return;
      })
      .catch(error => {
        console.error('Error scraping URL:', error);
      });
  } else {
    return Promise.reject(new Error('no doc.link, which is required!'));
  }
});
