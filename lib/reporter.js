const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const publisher = require('./testrail-publisher');

function _validate(options, name) {
  if (!options) {
    throw new Error('Missing --reporter-options in mocha.opts');
  }
  if (!options[name]) {
    throw new Error(
      `Missing ${name} value. Please update --reporter-options in mocha.opts`
    );
  }
}

/**
 * Initialize a new `TestrailAdvanced` reporter.
 *
 * @param {Runner} runner
 * @param {{reporterOptions:{suiteName:string,domain:string,username:string,password:string,projectId:string,publish:Function}}} options   Options to pass to report generator
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

  const {
    suiteName,
    projectId,
    domain,
    username,
    password
  } = options.reporterOptions;

  const onComplete = options.reporterOptions.onComplete || (() => {});
  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor(suiteName))
    .then(results => {
      return results;
    })
    .then(results =>
      publisher.publish(
        projectId,
        suiteName,
        results,
        '',
        domain,
        username,
        password,
        onComplete
      )
    );
}

module.exports = TestrailAdvanced;
