const path = require('path');

const {
  withWorkspaces,
  verifyJestResults,
  verifyEslintResults,
  verifyCoverage,
  verifyFilelist,
} = require('@unfig/testutils');

const fixturesDir = path.resolve(__dirname, '../fixtures');
const { initWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../__test-wkspcs__/lib')
);

const toolkit = path.resolve(__dirname, '../lib');

test('Shows help', async () => {
  const { exec } = await initWorkspace(
    path.join(fixturesDir, 'lib'),
    toolkit
  );
  const out = await exec(['--help']);
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
  const { cmd, dir, exec } = await initWorkspace(
    path.join(fixturesDir, 'lib'),
    toolkit
  );

  const buildResult = await cmd('build');
  expect(buildResult.code).toBe(0);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));

  const testResult = await exec([
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

  const lintResult = await cmd([
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

test('Detects lint', async () => {
  const { exec, dir } = await initWorkspace(
    path.join(fixturesDir, 'libWithLint'),
    toolkit
  );
  const lintResult = await exec(['lint']);
  expect(lintResult.code).toBe(1);
  expect(lintResult.stdout).toMatch(
    /'x' is assigned a value but never used.+no-unused-vars/
  );
  expect(lintResult.stdout).toMatch(/1 problem \(1 error, 0 warnings\)/);
  const lint2Result = await exec([
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

test('Detects bad source', async () => {
  const { exec } = await initWorkspace(
    path.join(fixturesDir, 'badSrc'),
    toolkit
  );
  const buildResult = await exec(['build']);
  expect(buildResult.code).toBe(1);
  expect(buildResult.stderr).toMatch(/SyntaxError/);

  const lintResult = await exec(['lint']);
  expect(lintResult.code).toBe(1);
  expect(lintResult.stdout).toMatch(/error.+Parsing error/);

  const testResult = await exec([
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

test('Detects failed test', async () => {
  const { exec, dir } = await initWorkspace(
    path.join(fixturesDir, 'libFailTest'),
    toolkit
  );
  const testResult = await exec([
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
