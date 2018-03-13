const R = require('ramda');
const os = require('os');
const testrailUtil = require('../lib/testrail-util');
/* eslint-disable no-unused-vars */
/* This helps with intellisense */
const Testrail = require('testrail-api');
/* eslint-enable no-unused-vars */

const _formatTest = ({ id, status_id, comment = '' }) => ({
  case_id: id,
  status_id,
  comment
});
const _flattenAndXform = R.compose(
  R.map(_formatTest),
  R.flatten,
  R.pluck('tests'),
  R.prop('sections')
);

/**
 *
 * @param {number} projectId
 * @param {string} suiteName
 * @param {{suite:{id?:number,name:string},sections:{id?:number,name:string,path:string[],tests:{ id?:number, status_id:1|2|3|4|5|6, comment:string }[]}[]}} testResults
 * @param {string} tag
 * @param {(results: {}[]) => void} onComplete
 * @param {Testrail} api
 * @param {boolean} forceCase
 */
const publish = function(
  projectId,
  suiteName,
  testResults,
  tag,
  onComplete,
  api,
  forceCase
) {
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
        } else if (forceCase) {
          return api
            .addCase(section_id, { title: mochaTestTitle })
            .then(R.prop('body'));
        }
        console.warn(
          `Case (${mochaTestTitle}) not found in section ${section_id} and force_case set to false. Skipping case creation!`
        );
        return { id: null };
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
          status_id: test.status_id,
          comment: test.comment
        };
      })
    )(tests);

    return Promise.all(testIdPromises);
  };
  const hasTestId = test => !!test.id;
  const getAllTestIds = (suiteId, sections) => {
    const testIds = R.map(section =>
      getAllTestIdsForSection(suiteId, section)
        .then(R.filter(hasTestId))
        .then(tests => {
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
    .then(
      R.tap(sections => {
        testRailResults.sections = sections;
      })
    )
    .then(() =>
      api
        .getRuns(projectId)
        .then(R.prop('body'))
        .then(R.find(run => run.name === tag))
    )
    .then(run => {
      if (run) return run;
      return api
        .addRun(projectId, {
          suite_id: testRailResults.suite.id,
          name: tag,
          description: `Run by ${os.hostname}`
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
