const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');

function validate(options, name) {
  if (options === null) {
    throw new Error('Missing --reporter-options in mocha.opts');
  }
  if (options[name] === null) {
    throw new Error(
      `Missing ${name} value. Please update --reporter-options in mocha.opts`
    );
  }
}

const formatTest = ({ title, section, comment, pass }) => ({
  section,
  title,
  status_id: pass ? 1 : 5,
  comment
});

/**
 *
 * @param {{section:string, title:string, pass:bool, comment:string}[]} testResults
 * @param {*} suiteName
 */
function prepareResults(testResults, suiteName) {
  const results = R.map(testResults, formatTest);
  const resultsBySectionName = R.groupBy(R.prop('section'), results);
  const pairs = R.toPairs(resultsBySectionName);
  const sections = R.map(pairs, ([name, tests]) => ({ id: null, name, tests }));

  const suite = {
    id: null,
    name: suiteName
  };

  const testRailResults = {
    suite,
    sections
  };

  return testRailResults;
}

/**
 * Initialize a new `TestrailAdvanced` reporter.
 *
 * @param {Runner} runner
 * @param {Object} options   Options to pass to report generator
 * @api public
 */
function TestrailAdvanced(runner, options) {
  Base.call(this, runner);

  const requiredKeys = [
    'suiteName',
    'domain',
    'username',
    'password',
    'projectId'
  ];
  R.forEach(key => validate(options.reporterOptions, key), requiredKeys);
  bindHandlersTo(runner);
}

module.exports = TestrailAdvanced;
