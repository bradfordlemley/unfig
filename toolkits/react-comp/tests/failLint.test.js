
const path = require('path');
const { withWorkspaces, verifyEslintResults } = require('@unfig/testutils');

const { initWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/react-comp')
);

let ws = null;
beforeAll(async () => {
  ws = await initWorkspace(
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../fixtures/failLint'),
    ['--no-install'],
  );
}, 30000);


test('Detects lint', async () => {
  const { dir, spawn } = ws;
  const lintResult = await spawn(['lint']);
  expect(lintResult.code).toBe(1);
  expect(lintResult.stdout).toMatch(
    /'x' is assigned a value but never used.+no-unused-vars/
  );
  expect(lintResult.stdout).toMatch(/1 problem \(1 error, 0 warnings\)/);
  const lint2Result = await spawn([
    'lint',
    '--output-file',
    'lintresults.json',
    '--format',
    'json',
  ]);
  expect(lint2Result.code).toBe(1);
  verifyEslintResults(
    path.join(dir, 'lintresults.json'),
    path.join(dir, 'expected-eslint-results.json')
  );
});
