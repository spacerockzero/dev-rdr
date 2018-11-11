// get articles from feed sources methods

// const {} = require('rxjs'); // later?
const Parser = require('rss-parser');
const parser = new Parser();
const got = require('got');
const extractor = require('unfluff');
const metascraper = require('metascraper');
const sources = require('./sources');

// get feeds
const getFeeds = async sources => {
  const sourceProms = sources.map(async source => await PerformanceResourceTiming.parseURL(source.url));
};

// filter out labeled content we don't want

// clean objects up so shiny

// getArticlesFlow

// scrapeUrl

// saveToDb

// updateArticles
