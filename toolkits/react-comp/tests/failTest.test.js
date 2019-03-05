
const path = require('path');

const { withWorkspaces, verifyJestResults } = require('@unfig/testutils');

const { initWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/react-comp')
);

let ws = null;
beforeAll(async () => {
  ws = await initWorkspace(
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../fixtures/failTest'),
    ['--no-install'],
  );
}, 30000);


test('Detects failed test', async () => {
  const { dir, spawn } = ws;
  const testResult = await spawn([
    'test',
    '--json',
    '--outputFile',
    'testresults.json',
  ]);
  expect(testResult.code).toBe(1);
  expect(testResult.stderr).toMatch(/FAIL.+index\.test\.js/);
  expect(testResult.stderr).toMatch(/Test Suites:(.+)1 failed(.+)1 total/);
  expect(testResult.stderr).toMatch(
    /Tests:(.+)1 failed(.+)1 passed(.+)2 total/
  );
  verifyJestResults(
    path.join(dir, 'testresults.json'),
    path.join(dir, 'expected-testresults.json')
  );
});
