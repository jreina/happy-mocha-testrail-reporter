const { Base } = require('mocha').reporters;
const R = require('ramda');
const bindHandlersTo = require('./handlers');
const formatter = require('./formatter');
const publisher = require('./testrail-publisher');
const Testrail = require('testrail-api');
const moment = require('moment');

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
    onComplete,
    tag = `${suiteName} - ${createDate}`,
    testrailApi = new Testrail({
      host: `https://${domain}`,
      user: username,
      password
    }),
    force_case,
    force_section = false
  } = options.reporterOptions;

  const onDone = onComplete || (() => {});
  const createCases =
    force_case === undefined ? true : R.toLower(force_case) === 'true';
  bindHandlersTo(runner)
    .then(formatter.prepareResultsFor(suiteName))
    .then(results => {
      return results;
    })
    .then(results => {
      // lots of args. maybe consider a builder or similar here...
      publisher.publish(
        projectId,
        suiteName,
        results,
        tag,
        onDone,
        testrailApi,
        createCases,
        force_section
      );
    });
}

module.exports = TestrailAdvanced;
