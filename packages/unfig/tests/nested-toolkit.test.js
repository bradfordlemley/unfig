const fs = require('fs-extra');
const path = require('path');
const unfig = require('../lib');

const { withInitWorkspace } = require('@unfig/testutils');

let ws = null;
withInitWorkspace(
  w => ws = w,
  path.resolve(__dirname, '../../../__test-wkspcs__/nested-toolkit-'),
  path.resolve(__dirname, 'nested-toolkit/toolkit'),
);

// beforeAll(async () => {
//   const w = await initWorkspace(
//     path.resolve(__dirname, '../../../__test-wkspcs__/nested-toolkit-'),
//     path.resolve(__dirname, "nested-toolkit/toolkit"),
//   );
//   setWs(w)
//   // await execa('yarn', {cwd: ws.dir});
// }, 30000);

// afterAll(async () => ws.clean())

test('uses unfig from monorepo', async () => {
  const { dir } = ws;
  if (fs.existsSync(path.join(dir, 'node_modules', 'unfig'))) {
    throw new Error(`Unfig exists in ${dir}/node_modules`)
  }
});

test('Top config overrides child', () => {
  const { dir } = ws;
  expect(unfig.getCfg(path.join(dir, 'config1.js'))).toEqual(
    'top-config1'
  );
});

test('Nested config available', () => {
  const { dir } = ws;
  expect(unfig.getCfg(path.join(dir, 'config2.js'))).toEqual(
    'nested-config2'
  );
});

test('Calls nested config', () => {
  const { dir } = ws;
  expect(unfig.getCfg(path.join(dir, 'config5.js'))).toEqual(
    'top-config5--nested-config5'
  );
});

test('Top command overrides child', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd1'])).resolves.toEqual('top-cmd1-output');
});

test('Calls nested children.execCmd() of same name', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd3'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested children.execCmd() of different name', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd4'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command.exec() directly', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd5'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd7'])).resolves.toEqual('nested-cmd7-output');
});

test('Rejects non existing command', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmd-100'])).rejects.toThrow(
    /Command "cmd-100" is not available, use --help for usage/
  );
});

test('inits dependencies', async () => {
  const { dir } = ws;
  const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
  expect(pkgJson.devDependencies).toMatchObject({
    eslint: "5.10.0",
    babel: "6.0.0",
    rimraf: "2.6.3",
  });
});
