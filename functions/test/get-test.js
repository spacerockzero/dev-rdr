const mocha = require('mocha');
const {expect} = require('chai');

const {getArticles} = require('../lib/get');

describe('get', () => {
  describe('getArticles', () => {
    it('should not fail', () => {
      getArticles()
        .then(articles => {
          expect(articles).to.exist;
        })
        .catch(error => {
          expect(error).to.not.exist;
        });
    });
  });
});
