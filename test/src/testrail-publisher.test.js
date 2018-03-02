const { expect } = require('chai');

describe('dummy test suite', () => {
  it('should fail', () => {
    expect([1, 2, 3]).to.contain.members([4]);
  });

  it('should pass', () => {
    expect([1, 2, 3]).to.contain.members([2]);
  });
});
