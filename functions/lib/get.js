// get articles from db methods

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const getArticles = () => {
  return db
    .collection('publicArticles')
    .orderBy('createdOn', 'desc')
    .limit(50)
    .get()
    .then(snapshot => {
      const articles = [];
      snapshot.forEach(doc => {
        const document = doc.data();
        articles.push(document);
      });
      return articles;
    })
    .catch(err => {
      return Promise.reject(err);
    });
};

module.exports = {
  getArticles
};
