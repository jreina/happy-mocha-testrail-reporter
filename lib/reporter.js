const { Base } = require('mocha').reporters;
const _ = require('lodash');

const publishResults = require('./testrail-publisher.js');

function validate(options, name) {
  if (options == null) {
    throw new Error('Missing --reporter-options in mocha.opts');
  }
  if (options[name] == null) {
    throw new Error(
      `Missing ${name} value. Please update --reporter-options in mocha.opts`
    );
  }
}

/**
 * Aggregate the results of the mocha run.
 * @param {{ name:string, meta:object, section:string, title:string, comment:string, pass:boolean }[]} testResults
 * @param {string} suiteName
 */
function prepareResults(testResults, suiteName) {
  /** @type {{ [key:string]: { id:string,section:string,pass:bool,tests:{meta:object,section:string,id:string,title:string,status_id:1|5,comment:string}[]}}} */
  const groups = _.reduce(
    testResults,
    (memo, { name, meta, section, title, comment, pass }) => {
      if (!_.has(memo, section)) {
        memo[section] = { id: null, section, tests: [] };
      }

      memo[section].tests.push({
        meta,
        section,
        id: null,
        title: title,
        status_id: pass ? 1 : 5,
        comment
      });

      return memo;
    },
    {}
  );

  /**
   * Describes the aggregate results.
   */
  const testRailResults = {
    /**
     * Describes the TestRail test suite associated with the entire mocha run.
     */
    suite: {
      /** TestRail ID for this test suite. This is looked up by the value of `name`.
       * @type {string}
       */
      id: null,
      /** The name of the test suite in TestRail. **MUST MATCH** what is in TestRail.
       * @type {string}
       */
      name: suiteName
    },
    /**
     * @type {{meta:object,section:string,id:string,title:string,status_id:1|5,comment:string}[]}
     */
    sections: _.values(groups)
  };

  return testRailResults;
}

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

/**
 * Initialize a new `TestrailAdvanced` reporter.
 *
 * @param {Runner} runner
 * @param {Object} options   Options to pass to report generator
 * @api public
 */
function TestrailAdvanced(runner, options) {
  Base.call(this, runner);

  // Validate options
  validate(options.reporterOptions, 'suiteName');
  validate(options.reporterOptions, 'domain');
  validate(options.reporterOptions, 'username');
  validate(options.reporterOptions, 'password');
  validate(options.reporterOptions, 'projectId');

  const {
    domain,
    password,
    projectId,
    username,
    suiteName
  } = options.reporterOptions;

  let n = 1;
  let passes = 0;
  let failures = 0;
  const testResults = [];

  runner.on('start', () => {
    const total = runner.grepTotal(runner.suite);
  });

  runner.on('pending', test => {});

  runner.on('test end', () => {
    n++;
  });

  runner.on('pass', test => {
    passes++;
    testResults.push({
      meta: test.parent.meta,
      section: test.parent.meta.section,
      title: test.title,
      pass: true
    });
    console.log('ok %d %s', n, title(test));
  });

  runner.on('fail', (test, err) => {
    failures++;
    testResults.push({
      meta: test.parent.meta,
      section: test.parent.fullTitle(),
      title: test.title,
      pass: false,
      comment: err.stack
    });
    console.log('not ok %d %s', n, title(test));
    if (err.stack) {
      console.log(err.stack.replace(/^/gm, '  '));
    }
  });

  runner.on('end', () => {
    console.log(`# tests ${passes + failures}`);
    console.log(`# pass ${passes}`);
    console.log(`# fail ${failures}`);

    console.log('Formatting Test Results for TestRail...');
    const testRailResults = prepareResults(testResults, suiteName);

    /*
    publishResults(
      domain,
      username,
      password,
      projectId,
      suiteName,
      testRailResults
    );
    */
  });
}

module.exports = TestrailAdvanced;
