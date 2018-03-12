const R = require('ramda');
const Testrail = require('testrail-api');

/**
 * Creates a section object for a section object and a list of tests.
 * Curried.
 */
const _createSectionFor = (
  /**
   * @type {{id:number,name:string}}
   */ { id, name }
) => (/** @type {Object.<string, any>[]} */ tests) => ({ id, name, tests });

/**
 * Initialize the repository functions with a given Testrail API client
 * @param {Testrail} api
 */
const init = api => {
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
    const e = R.either();
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
      getAllTestIdsForSection(suiteId, section).then(_createSectionFor(section))
    )(sections);

    return Promise.all(testIds);
  };

  return {
    getSuiteId,
    getAllSectionIds,
    getTestId,
    getAllTestIdsForSection,
    getAllTestIds
  };
};

module.exports = init;
