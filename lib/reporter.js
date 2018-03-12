const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const publisher = require('./testrail-publisher');
const Testrail = require('testrail-api');

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
 * @param {{reporterOptions:{suiteName:string,domain:string,username:string,password:string,projectId:string,onComplete:(results: {}[]) => void,testrailApi?:Testrail}}} options   Options to pass to report generator
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
    password,
    onComplete,
    testrailApi
  } = options.reporterOptions;

  const onDone = onComplete || (() => {});
  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor(suiteName))
    .then(results => {
      return results;
    })
    .then(results => {
      const api =
        testrailApi ||
        new Testrail({
          host: `https://${domain}`,
          user: username,
          password
        });

      publisher.publish(projectId, suiteName, results, '', onDone, api);
    });
}

module.exports = TestrailAdvanced;
