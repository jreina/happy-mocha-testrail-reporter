const R = require('ramda');
const State = require('./suite-state');
const { parsePath, unifiedDiff, title } = require('./formatter');
const status = require('./test-statuses');

/** @returns {Promise<{section:string, title:string, comment:string, pass:boolean}[]>} */
const bindHandlersTo = runner =>
  new Promise(resolve => {
    const noop = () => {};
    const state = new State();

    const testPass = test => {
      state.addResult({
        path: parsePath(test),
        section: test.parent.fullTitle(),
        title: test.title,
        status_id: status.Passed,
        comment: `duration: ${test.duration}ms`
      });
      console.log('ok %d %s', state.count(), title(test));
    };

    const testFail = (test, err) => {
      const diff = unifiedDiff(err);
      state.addResult({
        section: test.parent.fullTitle(),
        path: parsePath(test),
        title: test.title,
        status_id: status.Failed,
        comment: `duration: ${test.duration}ms\n\nstack:\n${
          err.stack
        }\n\ndiff:\n${diff}`
      });
      console.log('not ok %d %s', state.count(), title(test));
      if (err.stack) {
        console.log(err.stack.replace(/^/gm, '  '));
      }
    };

    const testPending = test => {
      state.addResult({
        section: test.parent.fullTitle(),
        path: parsePath(test),
        title: test.title,
        status_id: status.Skipped,
        comment: 'test skipped'
      });
    };

    const suiteEnd = () => resolve(state.getResults());

    const mappings = [
      { evt: 'start', handler: noop },
      { evt: 'end', handler: suiteEnd },
      { evt: 'pass', handler: testPass },
      { evt: 'fail', handler: testFail },
      { evt: 'test end', handler: noop },
      { evt: 'pending', handler: testPending }
    ];

    R.forEach(({ evt, handler }) => runner.on(evt, handler), mappings);
  });

module.exports = bindHandlersTo;
