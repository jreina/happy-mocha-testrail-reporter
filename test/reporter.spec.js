const Mocha = require('mocha');
const reporter = require('../lib/reporter');
const path = require('path');
const R = require('ramda');
require('dotenv').config();

const testfile = path.join(__dirname, 'src/dummy.test.js');
const _reporterOptions = {
  suiteName: process.env.SUITE_NAME,
  domain: process.env.DOMAIN,
  username: process.env.USER,
  password: process.env.PASS,
  projectId: parseInt(process.env.PROJECT_ID, 10)
};

fdescribe('Advanced TestRail Reporter for Mocha', function() {
  fit(
    'Should run tests and have stuff in the reporter',
    function(onComplete) {
      const reporterOptions = { ..._reporterOptions, onComplete };
      const mocha = new Mocha({ reporter, reporterOptions });

      mocha.addFile(testfile);
      mocha.run();
    },
    30000
  );

  xit("Should blow up when you don't give it all of the required reporter options", function() {
    const badInput = R.omit(['suiteName'], _reporterOptions);
    const mocha = new Mocha({ reporter, reporterOptions: badInput });
    mocha.addFile(testfile);

    expect(() => {
      mocha.run();
    }).toThrowError(
      'Missing suiteName value. Please update --reporter-options in mocha.opts'
    );
  });
});
