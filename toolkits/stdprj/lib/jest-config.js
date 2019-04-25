// @flow strict
const fs = require('fs');
const path = require('path');

/*::

import type {StdPrjCfg} from '@unfig/stdprj-config';

import type {JestConfigType} from '@unfig/toolkit-jest';

*/

function makeJestCfg(cfg /* :StdPrjCfg */, file /* :string */) {
  const rootDir = path.dirname(file);

  const withRootDir = f => `<rootDir>/${f}`;
  const withRootTrailSlash = f => withRootDir(`${f}/`);
  const existsRel = f => fs.existsSync(path.join(rootDir, f));

  const roots = [cfg.srcDir];
  const setupFilesAfterEnv = [];
  if (cfg.testDir != null) {
    roots.push(cfg.testDir);
  }
  if (cfg.testDir != null) {
    setupFilesAfterEnv.push(path.join(cfg.testDir, 'setup.js'));
  }
  return ({
    coverageDirectory: cfg.coverageDir,
    collectCoverageFrom:
      cfg.jsSrcExts &&
      cfg.jsSrcExts.map(ext => withRootDir(`${cfg.srcDir}/**/*.${ext}`)),
    coveragePathIgnorePatterns: cfg.ignoreDirs.map(withRootTrailSlash),
    roots: roots.filter(existsRel).map(withRootDir),
    testMatch: cfg.testFilePatterns.map(withRootDir),
    moduleFileExtensions: cfg.jsSrcExts,
    transform: {
      [`^.+\\.(${cfg.jsSrcExts.join('|')})$`]: require.resolve('babel-jest'),
    },
    testPathIgnorePatterns: cfg.ignoreDirs.map(withRootTrailSlash),
    setupFilesAfterEnv: setupFilesAfterEnv.filter(existsRel).map(withRootDir),
  } /*:JestConfigType */);
}

module.exports = makeJestCfg;
