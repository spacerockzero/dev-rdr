const mocha = require('mocha');
const {expect} = require('chai');

describe('sources', () => {
  describe('whole file', () => {
    const sources = require('../lib/sources');
    it('should be importable', () => expect(sources).to.exist);
    it('should contain at least one item', () => expect(sources.length > 0).to.be.true);
  });

  describe("each item's required fields", () => {
    const sources = require('../lib/sources');
    sources.forEach(source => {
      it(`${source.name} should contain a name`, () => expect(source.name).to.exist);
      it(`${source.name} should contain a type`, () => expect(source.type).to.exist);
      it(`${source.name} should contain a url`, () => expect(source.url).to.exist);
    });
  });
});
