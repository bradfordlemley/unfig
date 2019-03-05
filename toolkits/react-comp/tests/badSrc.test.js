const path = require('path');
const { withWorkspaces } = require('@unfig/testutils');

const { initWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/react-comp')
);

let ws = {};
beforeAll(async () => {
  ws = await initWorkspace(
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../fixtures/badSrc'),
    ['--no-install'],
  );
}, 30000);


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
