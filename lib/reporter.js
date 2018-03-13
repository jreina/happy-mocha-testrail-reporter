const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const publisher = require('./testrail-publisher');
const Testrail = require('testrail-api');
const moment = require('moment');

const _validate = (options, name) => {
  if (!options) {
    throw new Error('Missing --reporter-options in mocha.opts');
  }
  if (!options[name]) {
    throw new Error(
      `Missing ${name} value. Please update --reporter-options in mocha.opts`
    );
  }
};

/**
 * Accepts a string which may be undefined and parses it as a bool
 * @param {string} val
 * @param {boolean} def
 */
const _parseBool = (val, def) => {
  return val === undefined ? def : R.toLower(val) === 'true';
};

const _noop = () => {};

/**
 * Initialize a new `TestrailAdvanced` reporter.
 *
 * @param {Runner} runner
 * @param {{reporterOptions:{suiteName:string,domain:string,username:string,password:string,projectId:string,onComplete:(results: {}[]) => void,tag?:string,testrailApi?:Testrail,force_case?:boolean,force_section?:boolean}}} options   Options to pass to report generator
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
  const createDate = moment(new Date()).format('MM/DD/YYYY HH:mm');

  const {
    suiteName,
    projectId,
    domain,
    username,
    password,
    force_case,
    onComplete = _noop,
    tag = `${suiteName} - ${createDate}`,
    testrailApi = new Testrail({
      host: `https://${domain}`,
      user: username,
      password
    })
  } = options.reporterOptions;

  const createCases = _parseBool(force_case, true);

  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor(suiteName))
    .then(results => {
      // lots of args. maybe consider a builder or similar here...
      publisher.publish(
        projectId,
        suiteName,
        results,
        tag,
        onComplete,
        testrailApi,
        createCases
      );
    });
}

module.exports = TestrailAdvanced;
