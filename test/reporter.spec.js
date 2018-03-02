const { expect } = require('chai');
const Mocha = require('mocha');
const reporter = require('../lib/reporter');

const reporterOptions = {
  suiteName: 'test suite',
  domain: '',
  username: '',
  password: '',
  projectId: ''
};

describe('Advanced TestRail Reporter', function() {
  it('Should break', function(done) {
    const mocha = new Mocha({ reporter, reporterOptions });
    mocha.addFile('test/src/testrail-publisher.test.js');
    mocha.run().on('test end', (a, b) => {
      console.log();
    });
    done();
  });
});
