const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const { withInitWorkspace } = require('@unfig/testutils');

let ws = null;
withInitWorkspace(
  w => ws = w,
  path.resolve(__dirname, '../__test-wkspcs__/badSrc-'),
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../fixtures/badSrc'),
  ["--no-install"]
);

test('Detects bad source', async () => {
  const {spawn} = ws;
  const buildResult = await spawn(['build']);
  expect(buildResult.code).toBe(1);
  expect(buildResult.stderr).toMatch(/SyntaxError/);

  const lintResult = await spawn(['lint']);
  expect(lintResult.code).toBe(1);
  expect(lintResult.stdout).toMatch(/error.+Parsing error/);

  const testResult = await spawn([
    'test',
    '--json',
    '--outputFile',
    'testresults.json',
  ]);
  expect(testResult.code).toBe(1);
  expect(testResult.stderr).toMatch(/FAIL.+index\.test\.js/);
  expect(testResult.stderr).toMatch(/Test Suites:(.+)1 failed(.+)1 total/);
  expect(testResult.stderr).toMatch(/Tests:(.+)0 total/);

});
