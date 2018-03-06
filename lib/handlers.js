const R = require('ramda');
const State = require('./suite-state');

/** @returns {Promise<{section:string, title:string, comment:string, pass:boolean}[]>} */
const bindHandlersTo = runner =>
  new Promise(resolve => {
    const noop = () => {};
    const state = new State();

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
      { evt: 'start', handler: noop },
      { evt: 'end', handler: suiteEnd },
      { evt: 'pass', handler: testPass },
      { evt: 'fail', handler: testFail },
      { evt: 'test end', handler: noop },
      { evt: 'pending', handler: noop }
    ];

    R.forEach(({ evt, handler }) => runner.on(evt, handler), mappings);
  });

module.exports = bindHandlersTo;
