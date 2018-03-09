const R = require('ramda');

const _idPattern = /\((C[0-9]+)\)/;
const _tryGetId = test => {
  const matchy = _idPattern.exec(test.title);
  return matchy ? Object.assign(test, { id: matchy[1] }) : test;
};

/**
 * Formats the section-tests groupings
 *
 */
const _formatSectionPair = (
  /**
   * @type {[string,{path?:string[],title:string,section:string,comment:string,pass:1|5}[]]}
   */ [name, tests]
) => ({ id: null, name, tests, path: R.split('.', name) });

/**
 * Prepare results to be sent to the publisher
 * @param {{section:string, title:string, pass:bool, comment:string}[]} testResults
 * @param {string} suiteName
 */
const prepareResultsFor = suiteName => testResults => {
  const results = R.map(_tryGetId, testResults);
  const getDotPath = R.compose(R.join('.'), R.prop('path'));
  const resultsBySectionName = R.groupBy(getDotPath, results);
  const pairs = R.toPairs(resultsBySectionName);
  const sections = R.map(_formatSectionPair, pairs);

  const suite = {
    id: null,
    name: suiteName
  };

  const testRailResults = {
    suite,
    sections
  };

  return testRailResults;
};

const _pathPattern = /^\[(.+)\]/;
const _parsePathRecursive = node =>
  node.parent
    ? R.concat(_parsePathRecursive(node.parent), [node.title])
    : [node.title];
const parsePath = test => {
  const path = _pathPattern.test(test.parent.title)
    ? _pathPattern.exec(test.parent.title)[1].split('.')
    : _parsePathRecursive(test.parent);
  const filteredPath = R.filter(x => x !== '', path);

  const result = filteredPath;

  return result;
};

module.exports = { prepareResultsFor, parsePath };
