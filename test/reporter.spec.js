const { expect } = require('chai');
const Mocha = require('mocha');
const reporter = require('../lib/reporter');
const path = require('path');

const reporterOptions = {
  suiteName: 'test suite',
  domain: '',
  username: '',
  password: '',
  projectId: '1'
};

describe('Advanced TestRail Reporter for Mocha', function() {
  it('Should run tests and have stuff in the reporter', function(done) {
    const mocha = new Mocha({ reporter, reporterOptions });
    const testfile = path.join(__dirname, 'src/dummy.test.js');
    mocha.addFile(testfile);
    mocha.run(done);
  });
});
