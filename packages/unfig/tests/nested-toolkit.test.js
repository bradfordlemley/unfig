const fs = require('fs-extra');
const path = require('path');
const unfig = require('../lib');

const {
  withWorkspaces,
} = require('@unfig/testutils');

const { createWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/nested-toolkit')
);

let ws = null, execCmd = null, dir = null;
beforeAll(async () => {
  ws = await createWorkspace(
    path.resolve(__dirname, "nested-toolkit/toolkit")
  );
  ({execCmd, dir} = ws);
}, 30000);

test('Top config overrides child', () => {
  expect(unfig.getCfg(path.join(dir, 'config1.js'))).toEqual(
    'top-config1'
  );
});

test('Nested config available', () => {
  expect(unfig.getCfg(path.join(dir, 'config2.js'))).toEqual(
    'nested-config2'
  );
});

test('Calls nested config', () => {
  expect(unfig.getCfg(path.join(dir, 'config5.js'))).toEqual(
    'top-config5--nested-config5'
  );
});

test('Top command overrides child', async () => {
  await expect(execCmd(['cmd1'])).resolves.toEqual('top-cmd1-output');
});

test('Calls nested children.execCmd() of same name', async () => {
  await expect(execCmd(['cmd3'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested children.execCmd() of different name', async () => {
  await expect(execCmd(['cmd4'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command.exec() directly', async () => {
  await expect(execCmd(['cmd5'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command', async () => {
  await expect(execCmd(['cmd7'])).resolves.toEqual('nested-cmd7-output');
});

test('Rejects non existing command', async () => {
  await expect(execCmd(['cmd-100'])).rejects.toThrow(
    /Command "cmd-100" is not available, use --help for usage/
  );
});

test('inits dependencies', async () => {
  const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
  expect(pkgJson.devDependencies).toMatchObject({
    eslint: "5.10.0",
    babel: "6.0.0",
    rimraf: "2.6.3",
  });
});
