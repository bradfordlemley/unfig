// const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const { verifyDir } = require('@unfig/testutils');

const unfig = require('../lib');

const testPkgs = path.resolve(__dirname, '../../../__testpkgs__');
let workspaceDir = null;

beforeEach(() => {
  fs.mkdirsSync(testPkgs);
  workspaceDir = fs.mkdtempSync(`${testPkgs}/create-`);
});
afterEach(() => {
  workspaceDir && fs.removeSync(workspaceDir);
});

test('Create', async () => {
  await unfig.execCmd([
    'create',
    workspaceDir,
    '--toolkit',
    path.join(__dirname, './simple-toolkit/simple-toolkit.js'),
    '--frameworkPkg',
    path.join(__dirname, '..'),
  ]);

  verifyDir(workspaceDir, [
    '.config1.js',
    '.unfig.js',
    'config2.js',
    'config3.js',
    'node_modules',
    'package.json',
  ]);
});
