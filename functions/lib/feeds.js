// get articles from feed sources methods

// const {} = require('rxjs'); // later?
const Parser = require('rss-parser');
const parser = new Parser();
const got = require('got');
const extractor = require('unfluff');
const metascraper = require('metascraper');
const sources = require('./sources');
const trim = require('trim');

// get feeds
const getFeeds = async sources => {
  try {
    const sourceProms = sources.map(async source => await parser.parseURL(source.url));
    const res = await Promise.all(sourceProms);
    // console.log(JSON.stringify(res, null, 2));
    return res;
  } catch (error) {
    console.log('getFeeds error:', error);
    return;
  }
};

// flatten feeds
const flattenFeeds = feedData => {
  return [].concat(
    ...feedData.map(source => {
      return source.items.map(item => {
        item.feedsrc = trim(source.title);
        if (item.categories) {
          item.labels = item.categories;
        }
        return item;
      });
    })
  );
};

// filter out labeled content we don't want
const filterLabels = labels => {
  return labels.filter(
    label =>
      label.toLowerCase() !== 'uncategorized' &&
      label.toLowerCase() !== 'sponsored' &&
      label.toLowerCase() !== '_hideincontentads'
  );
};

// clean objects up so shiny
const cleanObjects = objects => {
  const cleaned = objects.map(item => {
    let cleanObj = {
      title: trim(item.title),
      link: trim(item.link),
      feedsrc: item.feedsrc,
      pubDate: item.pubDate
    };
    if (item.labels) {
      const filteredLabels = filterLabels(item.labels);
      cleanObj.labels = filteredLabels;
    }
    return cleanObj;
  });
  return cleaned;
};

// getArticlesFlow
const processFlow = async sources => {
  const content = await getFeeds(sources);
  const flattened = flattenFeeds(content);
  const cleanedContent = cleanObjects(flattened);
  return cleanedContent;
};

// scrapeUrl
const scrapeUrl = async targetUrl => {
  // scrape link url for meta, ogdata
  const {body: html, url} = await got(targetUrl);
  const metaData = extractor(html);
  return metaData;
};

// saveToDb

// updateArticles

module.exports = {
  getFeeds,
  flattenFeeds,
  filterLabels,
  processFlow,
  scrapeUrl
};
