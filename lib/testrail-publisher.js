const R = require('ramda');
/* eslint-disable no-unused-vars */
/* This helps with intellisense */
const Testrail = require('testrail-api');
/* eslint-enable no-unused-vars */

const _formatTest = ({ id, status_id, comment }) => ({
  case_id: id,
  status_id,
  comment
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
const publish = (projectId, suiteName, testResults, api) => {
  const getSuiteId = mochaSuiteName =>
    api
      .getSuites(projectId)
      .then(suites => {
        const existingTestRailSuite = R.find(
          suites,
          suite => suite.name === mochaSuiteName
        );
        if (existingTestRailSuite) {
          return existingTestRailSuite;
        }
        throw new Error(`No suite exists with name ${mochaSuiteName}`);
      })
      .then(suite => suite.id);

  const getSectionId = (suiteId, mochaSectionName) =>
    api
      .getSections(projectId, { suite_id: suiteId })
      .then(sections => {
        const existingTestRailSection = R.find(
          sections,
          section => section.name === mochaSectionName
        );
        if (existingTestRailSection) {
          return existingTestRailSection;
        }
        throw new Error(
          `Section ${mochaSectionName} does not exist within ${suiteId}`
        );
      })
      .then(section => section.id);

  const getAllSectionIds = (suiteId, sections) => {
    const sectionIds = R.map(section =>
      getSectionId(suiteId, section.name).then(sectionId => ({
        id: sectionId,
        name: section.name,
        tests: section.tests
      }))
    )(sections);

    return Promise.all(sectionIds);
  };
  const getTestId = (suite_id, section_id, mochaTestTitle) =>
    api
      .getCases(projectId, { suite_id, section_id })
      .then(cases => {
        const existingTestRailCase = R.find(
          cases,
          test => test.title === mochaTestTitle
        );
        if (existingTestRailCase) {
          return existingTestRailCase;
        }
        return api.addCase(section_id, { title: mochaTestTitle });
      })
      .then(test => test.id);

  const getAllTestIdsForSection = (suiteId, { id, tests }) => {
    const testIdPromises = R.map(({ title, status_id }) =>
      getTestId(suiteId, id, title).then(testId => ({
        id: testId,
        title,
        status_id
      }))
    )(tests);

    return Promise.all(testIdPromises);
  };
  const getAllTestIds = (suiteId, sections) => {
    const testIds = R.map(section =>
      getAllTestIdsForSection(suiteId, section).then(tests => ({
        id: section.id,
        name: section.name,
        tests
      }))
    )(sections);

    return Promise.all(testIds);
  };
  const testRailResults = R.clone(testResults);

  getSuiteId(testResults.suite.name)
    .then(suiteId => {
      testRailResults.suite.id = suiteId;
      return getAllSectionIds(suiteId, testResults.sections);
    })
    .then(sections => getAllTestIds(testRailResults.suite.id, sections))
    .then(sections => {
      testRailResults.sections = sections;
      return api.addRun(projectId, {
        suite_id: testRailResults.suite.id,
        name: `${
          testRailResults.suite.name
        } Automated test run created ${new Date().toISOString()}`
      });
    })
    .then(run => {
      const results = _flattenAndXform(testRailResults);
      return api.addResultsForCases(run.id, { results });
    })
    .then(() => console.log('Finished publishing'))
    .catch(err => {
      console.log(err);
    });
};

module.exports = { publish };
