// @flow
const treeKill = require('tree-kill');
const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const {
  readStreamUntil,
  verifyCoverage,
  verifyEslintResults,
  verifyFilelist,
  verifyJestResults,
  withInitWorkspace,
} = require('@unfig/testutils');

let ws;
withInitWorkspace(
  w => (ws = w),
  path.resolve(__dirname, '../__test-wkspcs__/success-'),
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../fixtures/success'),
  ['--no-install'],
  { keep: true }
);

function kill(pid, sig) {
  return new Promise(resolve => treeKill(pid, sig, resolve));
}

test('Includes dependencies', async () => {
  const { dir } = ws;
  // eslint-disable-next-line node/no-unpublished-require
  const toolkit = require('unfig').loadToolkit(dir);
  if (!toolkit) {
    throw new Error(`Could not get toolkit`);
  }
  expect(Object.keys(toolkit.toolDependencies)).toEqual([
    '@babel/cli',
    '@babel/core',
    '@babel/preset-env',
    'babel-core',
    'babel-eslint',
    'babel-jest',
    'babel-preset-react-app',
    'eslint',
    'eslint-plugin-flowtype',
    'eslint-plugin-jsx-a11y',
    'eslint-plugin-react',
    'jest',
    'rollup',
    'typescript',
  ]);
});

test('Shows help', async () => {
  const { spawn } = ws;
  const out = await spawn(['--help']);
  expect(out.code).toBe(0);
  expect(out.stdout).toMatch(/^Usage:.+<command>/);
  expect(out.stdout).toMatch(/\nCommands:/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+init\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+build\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+lint\s+/);
  expect(out.stdout).toMatch(/\n\s+\S+\s+jest\s+/);
  expect(out.stdout).toMatch(/\nGlobal Options:/);
  expect(out.stdout).toMatch(/\nOptions:/);
});

test('Starts', async () => {
  const { dir, spawn } = ws;
  const proc = spawn(['start']);
  const tscRegex = /Found 0 errors. Watching for file changes/;
  const errOutput = await readStreamUntil(proc.stdout, tscRegex, 25000);
  const regex = /dist[/\\]mylib.esm.js/;
  const output = await readStreamUntil(proc.stderr, regex, 5000);
  await kill(proc.pid);
  console.log('killed: ', proc.killed);
  expect(errOutput).toMatch(tscRegex);
  expect(output).toMatch(regex);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));
});

test('Builds', async () => {
  const { dir, spawn } = ws;
  const buildResult = await spawn(['build']);
  if (buildResult.code) {
    console.log(`stdout: ${buildResult.stdout}`);
    console.log(`stderr: ${buildResult.stderr}`);
  }
  expect(buildResult.code).toBe(0);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));
});

test('Typescript checks', async () => {
  const { spawn } = ws;
  const result = await spawn(['tscCheck']);
  if (result.code) {
    console.log(`stdout: ${result.stdout}`);
    console.log(`stderr: ${result.stderr}`);
  }
  expect(result.code).toBe(0);
});

test('Tests', async () => {
  const { dir, spawn } = ws;
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
});

test('Lints', async () => {
  const { dir, spawn } = ws;
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
