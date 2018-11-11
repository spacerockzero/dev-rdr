const functions = require('firebase-functions');
const {getArticles} = require('./lib/get');
const {updateArticles} = require('./lib/update');

exports.getArticles = functions.https.onRequest(async (req, res) => {
  // limit
  // page
  // sort
  let result;
  let status;
  try {
    const result = await getArticles();
    status = 200;
  } catch (err) {
    status = 500;
    result = err;
    console.error('getArticles endpoint err:', err);
  }
  return res.status(status).send(result);
});

exports.updateArticles = functions.https.onRequest(async (req, res) => {
  let result;
  let status;
  try {
    result = await updateArticles();
    status = 200;
  } catch (err) {
    result = err;
    status = 500;
    console.error('updatefeed endpoint err:', err);
  }
  return res.status(status).send(result);
});
