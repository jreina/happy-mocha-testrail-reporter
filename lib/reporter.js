const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const Testrail = require('testrail-api');

function _validate(options, name) {
  if (options === null) {
    throw new Error('Missing --reporter-options in mocha.opts');
  }
  if (options[name] === null) {
    throw new Error(
      `Missing ${name} value. Please update --reporter-options in mocha.opts`
    );
  }
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
  R.forEach(key => _validate(options.reporterOptions, key), requiredKeys);

  const api =
    options.reporterOptions.api ||
    new Testrail({
      host: `https://${options.reporterOptions.domain}`,
      user: options.reporterOptions.username,
      password: options.reporterOptions.password
    });

  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor('Big Bad Test Suite'))
    .then(results => {
      return results;
    });
}

module.exports = TestrailAdvanced;
