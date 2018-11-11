const mocha = require('mocha');
const {expect} = require('chai');

const {makeArticle, validateArticle} = require('../lib/article');

describe('article', () => {
  describe('makeArticle', () => {
    it('should return valid article from minimum valid input', () => {
      const validInput = {
        title: 'totes legit article',
        link: 'https://www.jakobanderson.com',
        feedsrc: 'totes legit source'
      };
      const newArticle = makeArticle(validInput);
      expect(newArticle).to.not.be.an('error');
    });

    it('should return valid article from maximum valid input', () => {
      const validInput = {
        title: 'totes legit article',
        link: 'https://www.jakobanderson.com',
        feedsrc: 'totes legit source',
        labels: [],
        opengraph: {},
        pubdate: new Date(1541900024256)
      };
      const newArticle = makeArticle(validInput);
      expect(newArticle).to.not.be.an('error');
    });

    it('should reject incomplete input', () => {
      const incompleteInput = {
        title: 'notlegit article'
      };
      const newArticle = makeArticle(incompleteInput);
      expect(newArticle).to.be.an('error');
    });
  });
});
