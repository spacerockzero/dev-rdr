// article constructor
const Joi = require('joi');

// article schema
const schema = Joi.object().keys({
  title: Joi.string().required(),
  link: Joi.string()
    .uri()
    .required(),
  feedsrc: Joi.string().required(),
  labels: Joi.array().items(Joi.string()),
  opengraph: Joi.object(),
  pubdate: Joi.date()
});

const makeArticle = function(articleObj) {
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
