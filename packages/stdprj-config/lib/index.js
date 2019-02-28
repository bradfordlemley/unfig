//@flow strict
const fs = require('fs');
const path = require('path');

const combine = require('./combine');

/*::

export type FileMatchPattern = string;
export type PrjSubDir = string;         // dir path relative to proj root, e.g. "test" is <prj>/test.

export type StdPrjCfg = {|
  coverageDir: PrjSubDir,        // coverage output
  entry: string,
  ignoreDirs: $ReadOnlyArray<PrjSubDir>,  // don't lint, test, coverage, build, etc.
  jsSrcExts: $ReadOnlyArray<string>,
  publishDir: PrjSubDir,         // build output
  srcDir: PrjSubDir,             // src and tests; non-tests get built to publishDir
  srcDirTestFilePatterns: $ReadOnlyArray<FileMatchPattern>,  // specify which files in srcDir are tests
  testDir?: PrjSubDir,                               // only tests; transpiled, not published
  testDirTestFilePatterns: $ReadOnlyArray<FileMatchPattern>, // specify which files in testDir are tests
  testFilePatterns: $ReadOnlyArray<FileMatchPattern>, // specify which files are tests
|}

export type StdPrjUserCfg = {|
  coverageDir?: PrjSubDir,        // coverage output
  entry?: string,
  ignoreDirs?: $ReadOnlyArray<PrjSubDir>,  // don't lint, test, coverage, build, etc.
  jsSrcExts?: $ReadOnlyArray<string>,
  publishDir?: PrjSubDir,         // build output
  srcDir?: PrjSubDir,             // src and tests; non-tests get built to publishDir
  srcDirTestFilePatterns?: $ReadOnlyArray<FileMatchPattern>,  // specify which files in srcDir are tests
  testDir?: PrjSubDir,                               // only tests; transpiled, not published
  testDirTestFilePatterns?: $ReadOnlyArray<FileMatchPattern>, // specify which files in testDir are tests
  testFilePatterns?: $ReadOnlyArray<FileMatchPattern>, // specify which files are tests
|}

*/

const defaultCfg = {
  coverageDir: 'coverage',
  ignoreDirs: [],
  jsSrcExts: ['ts', 'tsx', 'js', 'jsx'],
  publishDir: 'dist',
  srcDir: 'src',
  testDir: 'tests',
};

function findEntry(srcDir /*: string */, exts /*: $ReadOnlyArray<string> */) {
  return combine(['index.'], exts)
    .map(f => path.join(srcDir, f))
    .find(f => fs.existsSync(f));
}

function getCfg(userCfg /* :?StdPrjUserCfg */) /* :StdPrjCfg */ {
  const cfg = {
    ...defaultCfg,
    ...userCfg,
  };

  cfg.srcDirTestFilePatterns =
    cfg.srcDirTestFilePatterns ||
    combine(['**/*.test.', '**/*.spec.'], cfg.jsSrcExts);

  cfg.testDirTestFilePatterns =
    cfg.testDirTestFilePatterns ||
    combine(['**/*test*.', '**/*spec*.'], cfg.jsSrcExts);

  cfg.testFilePatterns =
    cfg.testFilePatterns ||
    cfg.srcDirTestFilePatterns
      .map(patt => `${cfg.srcDir}/${patt}`)
      .concat(
        cfg.testDirTestFilePatterns.map(patt => `${cfg.testDir}/${patt}`)
      );

  cfg.ignoreDirs = (cfg.ignoreDirs || []).concat(['flow-typed']);

  cfg.entry = cfg.entry || findEntry(cfg.srcDir, cfg.jsSrcExts) || '';

  return cfg;
}

module.exports = {
  getCfg,
};
