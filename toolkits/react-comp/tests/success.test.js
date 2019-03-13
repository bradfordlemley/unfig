// @flow
const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const { verifyCoverage, verifyEslintResults, verifyFilelist, verifyJestResults, withInitWorkspace } = require('@unfig/testutils');

let ws;
withInitWorkspace(
  w => ws = w,
  path.resolve(__dirname, '../__test-wkspcs__/success-'),
  path.resolve(__dirname, '../lib'),
  path.resolve(__dirname, '../fixtures/success'),
  ["--no-install"],
  {keep: true},
);

test('toolkit includes dependencies', async () => {
  const { dir } = ws;
  // eslint-disable-next-line node/no-unpublished-require
  const toolkit = require('unfig').loadToolkit(dir);
  if (!toolkit) {
    throw new Error(`Could not get toolkit`)
  }
  expect(Object.keys(toolkit.toolDependencies)).toEqual([
    "@babel/cli",
    "@babel/core",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/preset-env",
    "@babel/preset-flow",
    "@babel/preset-react",
    "@babel/preset-typescript",
    "babel-core",
    "babel-eslint",
    "babel-jest",
    "eslint",
    "eslint-plugin-flowtype",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-react",
    "jest",
    "rollup",
  ])
});

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

test.skip('Builds typedfs', async () => {
  const { dir, spawn } = ws;
  // const buildResult = await spawn(['build']);
  // expect(buildResult.code).toBe(0);
  // verifyFilelist(path.join(dir, 'expected-buildfiles.json'));

  const tsBuildResult = await spawn(['buildTsDefs', '-d', "src/**/*"]);
  console.log(`stdout: ${tsBuildResult.stdout}`)
  console.log(`stderr: ${tsBuildResult.stderr}`)
  expect(tsBuildResult.code).toBe(0);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));
});

test('Builds, tests, and lints', async () => {
  const { dir, spawn } = ws;
  const buildResult = await spawn(['build']);
  expect(buildResult.code).toBe(0);
  verifyFilelist(path.join(dir, 'expected-buildfiles.json'));

  const tsBuildResult = await spawn(['buildTsDefs']);
  expect(tsBuildResult.code).toBe(0);

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
