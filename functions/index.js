// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
// app libs
const {processFlow, scrapeUrl} = require('./lib/feeds');
const {updateArticles} = require('./lib/update');
const {makeArticle} = require('./lib/article');
const sources = require('./lib/sources');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const settings = {
  timestampsInSnapshots: true
};
db.settings(settings);

// methods

// get articles method for UI
const getArticlesHandler = async (limit, page, sort) => {
  // TODO: limit, page, sort
  try {
    const snapshot = await db
      .collection('publicArticles')
      .orderBy('createdOn', 'desc')
      .limit(50)
      .get();
    const articles = [];
    snapshot.forEach(doc => {
      const document = doc.data();
      const timestamp = document.createdOn;
      document.createdOn = timestamp.toDate();
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
      return saveArticles(articles).then(results => {
        return results;
      });
    });
};

// save new articles to db
const saveArticles = articles => {
  const collectionRef = db.collection('publicArticles');
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
  // req.query.limit
  // req.query.page
  // req.query.sort
  let result;
  let status;
  // TODO: limit, page, sort
  getArticlesHandler()
    .then(result => res.status(200).send(result))
    .catch(error => {
      console.error('getArticles endpoint err:', error);
      return res.status(500).send(error);
    });
});

exports.updateArticles = functions.https.onRequest(async (req, res) => {
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

// When new docs are saved, go get their metadata for thumbnails and whatnot
exports.getMeta = functions.firestore.document('publicArticles/{articleId}').onCreate(event => {
  console.log('getMeta', event.data);
  const doc = event.data.data();
  console.log('doc:', doc);
  const linkURL = doc.link;
  console.log('link:', linkURL);
  if (linkURL) {
    scrapeUrl(linkURL).then(metadata => {
      console.log('metadata:', metadata);
      // console.log('metadata.image', metadata.image);
      if (metadata.image) {
        return db
          .collection('publicArticles')
          .doc(doc.id)
          .update({image: metadata.image})
          .then(result => {
            console.log('doc.id', doc.id);
            console.log('image:', metadata.image);
            console.log('db write result:', result);
            return metadata;
          })
          .catch(err => console.error('Err writing img to db:', err));
      }
      return metadata;
    });
  }
});
