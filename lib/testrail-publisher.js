const R = require('ramda');
const moment = require('moment');
const os = require('os');
const testrailUtil = require('../lib/testrail-util');
/* eslint-disable no-unused-vars */
/* This helps with intellisense */
const Testrail = require('testrail-api');
/* eslint-enable no-unused-vars */

const _formatTest = ({ id, status_id }) => ({
  case_id: id,
  status_id
});
const _flattenAndXform = R.compose(
  R.map(_formatTest),
  R.flatten,
  R.map(R.prop('tests')),
  R.prop('sections')
);

/**
 *
 * @param {number} projectId
 * @param {string} suiteName
 * @param {{ id:number, status_id:1|2|3|4|5, comment:string }[]} testResults
 * @param {Testrail} api
 */
const publish = function(
  projectId,
  suiteName,
  testResults,
  tag,
  domain,
  user,
  password,
  onComplete
) {
  const api = new Testrail({
    host: `https://${domain}`,
    user,
    password
  });

  const getSuiteId = mochaSuiteName => {
    return api
      .getSuites(projectId)
      .then(R.prop('body'))
      .then(suites => {
        const existingTestRailSuite = R.find(
          suite => suite.name === mochaSuiteName,
          suites
        );
        if (existingTestRailSuite) {
          return existingTestRailSuite;
        }
        throw new Error(`No suite exists with name ${mochaSuiteName}`);
      })
      .then(R.prop('id'));
  };

  const getAllSectionIds = (suiteId, sections) => {
    const sectionIds = R.map(section =>
      api
        .getSections(projectId, { suite_id: suiteId })
        .then(R.prop('body'))
        .then(testrailUtil.resolveSectionPath(section.path))
        .then(s => ({
          id: s.id,
          name: section.name,
          tests: section.tests
        }))
    )(sections);

    return Promise.all(sectionIds);
  };
  const getTestId = (suite_id, section_id, mochaTestTitle) => {
    return api
      .getCases(projectId, { suite_id, section_id })
      .then(R.prop('body'))
      .then(cases => {
        const existingTestRailCase = R.find(
          test => test.title === mochaTestTitle,
          cases
        );
        if (existingTestRailCase) {
          return existingTestRailCase;
        }
        return api
          .addCase(section_id, { title: mochaTestTitle })
          .then(R.prop('body'));
      })
      .then(R.prop('id'));
  };

  const getAllTestIdsForSection = (suiteId, { id, tests }) => {
    const testIdPromises = R.map(test =>
      (test.id
        ? Promise.resolve(test.id)
        : getTestId(suiteId, id, test.title)
      ).then(testId => {
        return {
          id: testId,
          title: test.title,
          status_id: test.status_id
        };
      })
    )(tests);

    return Promise.all(testIdPromises);
  };
  const getAllTestIds = (suiteId, sections) => {
    const testIds = R.map(section =>
      getAllTestIdsForSection(suiteId, section).then(tests => {
        return {
          id: section.id,
          name: section.name,
          tests
        };
      })
    )(sections);

    return Promise.all(testIds);
  };
  const testRailResults = R.clone(testResults);

  getSuiteId(testResults.suite.name)
    .then(suiteId => {
      testRailResults.suite.id = suiteId;
      return getAllSectionIds(suiteId, testResults.sections);
    })
    .then(sections => {
      return getAllTestIds(testRailResults.suite.id, sections);
    })
    .then(sections => {
      testRailResults.sections = sections;
      if (tag) {
        // If tag is provided, try to find the test run matching that tag
        return api.getRuns(projectId).then(R.find(run => run.name === tag));
      }
      const createDate = moment(new Date()).format('MM/DD/YYYY HH:mm');
      return api
        .addRun(projectId, {
          suite_id: testRailResults.suite.id,
          name: `${testRailResults.suite.name} - ${createDate}`,
          description: `Run by ${os.hostname} at ${createDate}`
        })
        .then(R.prop('body'));
    })
    .then(run => {
      const results = _flattenAndXform(testRailResults);
      const data = { results };
      return api.addResultsForCases(run.id, data);
    })
    .then(() => console.log('Finished publishing'))
    .then(() => {
      if (onComplete) onComplete(testRailResults);
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = { publish };
