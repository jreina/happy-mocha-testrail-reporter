const R = require('ramda');
const State = require('./suite-state');

/** @returns {Promise<{section:string, title:string, comment:string, pass:boolean}[]>} */
const bindHandlersTo = runner => {
  const noop = () => {
    console.log('hi');
  };
  const state = new State();

  const suiteStart = noop;

  const testPending = noop;

  const testEnd = t => {
    t;
  };
  const testPass = test => {
    state.addResult({
      section: test.parent.fullTitle(),
      title: test.title,
      pass: true
    });
  };

  const testFail = (test, err) => {
    state.addResult({
      section: test.parent.fullTitle(),
      title: test.title,
      pass: false,
      comment: err.stack
    });
    if (err.stack) {
      console.log(err.stack.replace(/^/gm, '  '));
    }
  };

  const suiteEnd = () => {
    resolve(state.getResults());
  };

  const mappings = [
    { evt: 'start', handler: suiteStart },
    { evt: 'suite end', handler: suiteEnd },
    { evt: 'pass', handler: testPass },
    { evt: 'fail', handler: testFail },
    { evt: 'test end', handler: testEnd },
    { evt: 'pending', handler: testPending }
  ];

  R.forEach(({ evt, handler }) =>
    runner.on(
      evt,
      (a, b) => {
        console.log();
      },
      mappings
    )
  );
};

module.exports = bindHandlersTo;
