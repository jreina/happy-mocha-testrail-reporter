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
      it('should be a new case');
      it('should take like 400ms', function(done) {
        setTimeout(done, 400);
      });

      describe('Foo', function() {
        describe('Bar', function() {
          describe('Baz', function() {
            it('Should be in Foo->Bar->Baz->Foo->Bar->Baz', function() {});
          });
        });
      });
    });
  });
  describe('Foo', function() {
    it('should be in Foo->Foo');
  });
});
describe('[Foo.Bar.Baz] This is just a title', function() {
  it(
    'should also be in Foo->Bar->Baz, except this uses a single describe block'
  );
});
describe('section b', function() {
  it('should be at the root of section b');
});
