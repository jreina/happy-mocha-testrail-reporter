const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const Testrail = require('testrail-api');
const publisher = require('./testrail-publisher');

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

  const { suiteName, projectId } = options.reporterOptions;

  const api =
    options.reporterOptions.api ||
    new Testrail({
      host: options.reporterOptions.domain,
      user: options.reporterOptions.username,
      password: options.reporterOptions.password
    });

  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor('Big Bad Test Suite'))
    .then(results => {
      return results;
    })
    .then(results => publisher.publish(projectId, suiteName, results, api));
}

module.exports = TestrailAdvanced;
