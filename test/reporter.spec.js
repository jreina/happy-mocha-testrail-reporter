const { expect } = require("chai");

const tests = [{ section: "one" }, { section: "two" }, { section: "three" }];

tests.forEach(({ section }) => {
  describe(`test number ${section}`, function() {
    this.meta = { section };
    it("should pass", () => {
      return Promise.resolve({ test: section });
    });
  });
});
