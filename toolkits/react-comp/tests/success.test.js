// @flow
const path = require('path');
const { verifyCoverage, verifyEslintResults, verifyFilelist, verifyJestResults, withWorkspaces } = require('@unfig/testutils');

const { initWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/react-comp')
);

let ws = {};
beforeAll(async () => {
  ws = await initWorkspace(
    path.resolve(__dirname, '../lib'),
    path.resolve(__dirname, '../fixtures/success'),
    ['--no-install'],
  );
}, 30000);

test('Shows help', async () => {
  const { spawn } = ws;
  const out = await spawn(['--help']);
  expect(out.code).toBe(0);
  expect(out.stdout).toMatch(/^Usage:\s+\S+\s+<command>/);
  expect(out.stdout).toMatch(/\nCommands:/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+init\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+build\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+lint\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+jest\s+/);
  expect(out.stdout).toMatch(/\nGlobal Options:/);
  expect(out.stdout).toMatch(/\nOptions:/);
});

test('Builds, tests, and lints', async () => {
  const { dir, spawn } = ws;
  const buildResult = await spawn(['build']);
  expect(buildResult.code).toBe(0);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));

  const testResult = await spawn([
    'test',
    '--json',
    '--outputFile',
    'testresults.json',
    '--coverage',
  ]);
  expect(testResult.code).toBe(0);
  verifyJestResults(
    path.join(dir, 'testresults.json'),
    path.join(dir, 'expected-testresults.json')
  );
  verifyCoverage(
    path.join(dir, 'coverage/coverage-final.json'),
    path.join(dir, 'expected-coverage.json')
  );

  const lintResult = await spawn([
    'lint',
    '--output-file',
    'lintresults.json',
    '--format',
    'json',
  ]).catch(err => err);
  expect(lintResult.code).toBe(0);
  verifyEslintResults(
    path.join(dir, 'lintresults.json'),
    path.join(dir, 'expected-eslint-results.json')
  );
});
