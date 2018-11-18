// article constructor and validator
const Joi = require('joi');
const hash = require('hash.js/lib/hash/sha/1');

// article schema
const schema = Joi.object().keys({
  id: Joi.string().required(),
  title: Joi.string().required(),
  link: Joi.string()
    .uri({scheme: ['http', 'https']})
    .required(),
  feedsrc: Joi.string().required(),
  labels: Joi.array().items(Joi.string()),
  opengraph: Joi.object(),
  pubdate: Joi.date()
});

const makeArticle = function(articleObj) {
  // add id of hashed link url
  if (!articleObj.link) {
    // otherwise null here would create hash collisions between multiple hashed-null ids
    return new Error('article link is a required field.');
  }
  articleObj.id = hash()
    .update(articleObj.link)
    .digest('hex');
  // validate against schema
  const {error, value} = Joi.validate(articleObj, schema);
  if (error) {
    return error;
  }
  // if valid, set optional data defaults, if not given
  if (!articleObj.labels) articleObj.labels = [];
  if (!articleObj.opengraph) articleObj.opengraph = {};
  // set new data
  if (!articleObj.sentiment) articleObj.sentiment = {};
  if (!articleObj.createdOn) articleObj.createdOn = new Date(Date.now());
  return articleObj;
};

module.exports = {makeArticle};
