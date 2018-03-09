const sections = require('../fixtures/getSections');
const testrailUtil = require('../../lib/testrail-util');
const R = require('ramda');

const apiStub = { getSections: () => Promise.resolve(sections) };

describe('testrail-util', function() {
  describe('#resolveSectionPath', function() {
    it('should resolve the correct ID for a given section path', function(done) {
      const path = ['foo', 'bar', 'baz', 'biz'];
      const expected = 400;
      const actualPromise = testrailUtil.resolveSectionPath(
        0,
        0,
        path,
        apiStub
      );

      return actualPromise
        .then(R.prop('id'))
        .then(actual => expect(actual).toEqual(expected))
        .then(done);
    });

    it('should throw an error when the path does not exist', function(done) {
      const path = ['bar', 'foo'];
      const actualPromise = testrailUtil.resolveSectionPath(
        0,
        0,
        path,
        apiStub
      );

      actualPromise
        .then(result => expect(result).toBeUndefined())
        .catch(error => {
          expect(error).toBeDefined();
          expect(error.message).toContain('Could not resolve path');
          done();
        });
    });
  });
});
