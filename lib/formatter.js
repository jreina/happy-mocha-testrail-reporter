const R = require('ramda');
const diff = require('diff');

const _idPattern = /\(C([0-9]+)\)/;
const _tryGetId = test => {
  const matchy = _idPattern.exec(test.title);
  return matchy ? Object.assign(test, { id: parseInt(matchy[1], 10) }) : test;
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

/**
 * Returns a unified diff between two strings.
 * @see https://github.com/mochajs/mocha/blob/master/lib/reporters/base.js
 * @api private
 * @param {Error} err with actual/expected
 * @return {string} The diff.
 */
const unifiedDiff = err => {
  const indent = '      ';
  function cleanUp(line) {
    if (line[0] === '+') {
      return indent + line;
    }
    if (line[0] === '-') {
      return indent + line;
    }
    if (line.match(/@@/)) {
      return '--';
    }
    if (line.match(/\\ No newline/)) {
      return null;
    }
    return indent + line;
  }
  function notBlank(line) {
    return typeof line !== 'undefined' && line !== null;
  }
  const msg = diff.createPatch('string', err.actual, err.expected);
  const lines = msg.split('\n').splice(5);
  return `\n      + expected - actual\n\n${lines
    .map(cleanUp)
    .filter(notBlank)
    .join('\n')}`;
};

/**
 * Return a TAP-safe title of `test`
 *
 * @api private
 * @param {Object} test
 * @return {String}
 */
function title(test) {
  return test.fullTitle().replace(/#/g, '');
}

module.exports = { prepareResultsFor, parsePath, unifiedDiff, title };
