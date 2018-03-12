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
      it('should report a diff', function() {
        this.meta = { input: { foo: 'bar' } };
        const expected = [
          { name: 'Susan' },
          { name: 'Edward' },
          { name: 'Sara' }
        ];
        const actual = [
          { name: 'Susan' },
          { name: 'Edward', age: 32 },
          { name: 'Sara' }
        ];
        expect(actual).to.deep.equal(expected);
      });
    });
  });
});
