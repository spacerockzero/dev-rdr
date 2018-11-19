const mocha = require('mocha');
const {expect} = require('chai');

const {getSentiment} = require('../lib/sentiment');
const positiveDoc = {
  title: 'cats are simply the best',
  text:
    'more about how cats happen to be great. text tends to be either the entire article condensed text, or an abbreviated set of it.',
  opengraph: {
    title: 'cats are the best',
    description: 'more about how cats happen to be great'
  }
};
const negativeDoc = {
  title: 'cats are the worst',
  text:
    'more about how cats happen to be evil. text tends to be either the entire article condensed text, or an abbreviated set of it.',
  opengraph: {
    title: 'cats are the worst',
    description: 'more about how cats happen to be evil'
  }
};
const neutralDoc = {
  title: 'cats exist',
  text:
    'more about how cats happen to be around. text tends to be either the entire article condensed text, or an abbreviated set of it.',
  opengraph: {
    title: 'cats exist',
    description: 'more about how cats happen to exist'
  }
};

describe('sentiment', () => {
  describe('getSentiment', () => {
    it('must not fail', () => {
      const sent = getSentiment(neutralDoc);
      expect(sent.score).to.exist;
    });
    it('must detect neutral content', () => {
      const sent = getSentiment(neutralDoc);
      expect(sent.score).to.equal(0);
    });
    it('must detect negative content', () => {
      const sent = getSentiment(negativeDoc);
      expect(sent.score).to.be.lessThan(0);
    });
    it('must detect positive content', () => {
      const sent = getSentiment(positiveDoc);
      expect(sent.score).to.be.greaterThan(0);
    });
  });
});
