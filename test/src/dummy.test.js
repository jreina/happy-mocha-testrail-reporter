const { expect } = require('chai');

describe('dummy test suite', function() {
  it('should pass', function() {
    expect([1, 2, 3]).to.contain.members([2]);
  });
  it('should fail', function() {
    expect([1, 2, 3]).to.contain.members([4]);
  });
});

describe('dummy test suite 2', function() {
  it('should pass', function() {
    expect([1, 2, 3]).to.contain.members([2]);
  });
  it('should fail', function() {
    expect([1, 2, 3]).to.contain.members([4]);
  });
});
