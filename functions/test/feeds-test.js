const mocha = require('mocha');
const {expect} = require('chai');
const validUrl = require('valid-url');
const sources = [
  {
    name: 'Coding Horror',
    type: 'rss',
    url: 'https://blog.codinghorror.com/rss/'
  },
  {
    name: 'Joel on Software',
    type: 'rss',
    url: 'https://www.joelonsoftware.com/feed/'
  }
];

const {getFeeds, flattenFeeds, filterLabels} = require('../lib/feeds');

describe('feeds', function() {
  this.timeout(20000);
  let feeds;

  before(async () => {
    feeds = await getFeeds(sources);
    return;
  });

  after(() => {
    feeds = null;
  });

  describe('getFeeds', () => {
    it('should get all source feeds', () => {
      expect(feeds).to.exist;
      expect(feeds).to.have.lengthOf(2);
    });

    it('feeds should have required meta-data', () => {
      feeds.forEach(feed => {
        expect(feed.title).to.be.a('string');
        expect(feed.items).to.be.a('array');

        const isValidLink = validUrl.isUri(feed.items[0].link);

        expect(isValidLink).to.be.a('string'); // returns input string when valid URI
        expect(feed.items[0].pubDate).to.exist;
        expect(feed.items[0].title).to.be.a('string');
      });
    });
  });

  describe('flattenFeeds', () => {
    it('should flatten feeds', () => {
      const flat = flattenFeeds(feeds);
      expect(flat).to.be.a('array');
    });

    it('flat feed items should have required attrs', () => {
      const flat = flattenFeeds(feeds);
      const isValidLink = validUrl.isUri(flat[0].link);

      expect(isValidLink).to.be.a('string'); // returns input string when valid URI
      expect(flat[0].pubDate).to.exist;
      expect(flat[0].title).to.be.a('string');
    });
  });

  describe('filterLabels', () => {
    const labels = ['javascript', 'css', 'uncategorized', 'sponsored', '_hideincontentads'];
    const filtered = filterLabels(labels);
    it('should filter out unwanted', () => {
      expect(filtered).to.not.contain('uncategorized');
      expect(filtered).to.not.contain('sponsored');
      expect(filtered).to.not.contain('_hideincontentads');
    });
    it('should keep the good stuff', () => {
      expect(filtered).to.contain('javascript');
      expect(filtered).to.contain('css');
    });
  });
});
