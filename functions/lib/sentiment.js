const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// take a document object, and extract sentiment from relevant fields

const getSentiment = doc => {
  let input = `
    ${doc.title}, 
    ${doc.text}, 
    ${doc.opengraph.title},
    ${doc.opengraph.description}`;
  const sent = sentiment.analyze(input);
  return sent;
};

module.exports = {
  getSentiment
};
