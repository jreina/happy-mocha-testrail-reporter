function TestSuiteState() {
  /** @type {{section:string, title:string, comment:string, pass:boolean}[]} */
  const tests = [];
  this.addResult = test => {
    tests.push(test);
  };
  this.getResults = () => tests;
  this.count = () => tests.length;
}

module.exports = TestSuiteState;
