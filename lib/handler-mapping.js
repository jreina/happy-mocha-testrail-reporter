const getMappings = ({
  suiteStart,
  suiteEnd,
  testPending,
  testEnd,
  testPass,
  testFail
}) => [
  { evt: 'start', handler: suiteStart },
  { evt: 'suite end', handler: suiteEnd },
  { evt: 'pass', handler: testPass },
  { evt: 'fail', handler: testFail },
  { evt: 'test end', handler: testEnd },
  { evt: 'pending', handler: testPending }
];

module.exports = getMappings;
