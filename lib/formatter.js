const R = require('ramda');
const statusId = require('./test-statuses');

/** Formats a test result instance */
const _formatTest = (
  /**
   * @type {{title:string,section:string,comment:string,pass:boolean}}
   */ { title, section, comment, pass }
) => ({
  section,
  title,
  status_id: pass ? statusId.Passed : statusId.Failed,
  comment
});

/** Formats the section-tests groupings */
const _formatSectionPair = (
  /**
   * @type {[string,{title:string,section:string,comment:string,pass:1|5}[]]}
   */ [name, tests]
) => ({ id: null, name, tests });

/**
 * Prepare results to be sent to the publisher
 * @param {{section:string, title:string, pass:bool, comment:string}[]} testResults
 * @param {string} suiteName
 */
const prepareResultsFor = suiteName => testResults => {
  const results = R.map(_formatTest, testResults);
  const resultsBySectionName = R.groupBy(R.prop('section'), results);
  const pairs = R.toPairs(resultsBySectionName);
  const sections = R.map(_formatSectionPair, pairs);

  const suite = {
    id: null,
    name: suiteName
  };

  const testRailResults = {
    suite,
    sections
  };

  return testRailResults;
};

module.exports = { prepareResultsFor };
