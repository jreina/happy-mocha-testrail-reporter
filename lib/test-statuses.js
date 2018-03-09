const statuses = {
  /** @type {1} */
  Passed: 1,
  /** @type {2} */
  Blocked: 2,
  /** @type {3} */
  Untested: 3,
  /** @type {4} */
  Retest: 4,
  /** @type {5} */
  Failed: 5,
  /** @type {6} */
  Skipped: 6
};
Object.freeze(statuses);

module.exports = statuses;
