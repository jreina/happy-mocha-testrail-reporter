const { expect } = require('chai');

describe('Foo', function() {
  describe('Bar', function() {
    describe('Baz', function() {
      it('should pass', function() {
        expect(1).to.equal(1);
      });
      it('should fail', function() {
        expect(1).to.equal(2);
      });
      it('should be pending');
      it.skip('should be skipped');
    });
  });
});
