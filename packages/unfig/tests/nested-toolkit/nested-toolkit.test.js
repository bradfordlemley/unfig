const path = require('path');
const unfig = require('../../lib');

const exec = args => unfig.execCmd(['--rootDir', __dirname].concat(args));

test('Top config overrides child', () => {
  expect(unfig.getCfg(path.join(__dirname, 'config1.js'))).toEqual(
    'top-config1'
  );
});

test('Nested config available', () => {
  expect(unfig.getCfg(path.join(__dirname, 'config2.js'))).toEqual(
    'nested-config2'
  );
});

test('Calls nested config', () => {
  expect(unfig.getCfg(path.join(__dirname, 'config5.js'))).toEqual(
    'top-config5--nested-config5'
  );
});

test('Top command overrides child', async () => {
  await expect(exec(['cmd1'])).resolves.toEqual('top-cmd1-output');
});

test('Calls nested children.execCmd() of same name', async () => {
  await expect(exec(['cmd3'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested children.execCmd() of different name', async () => {
  await expect(exec(['cmd4'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command.exec() directly', async () => {
  await expect(exec(['cmd5'])).resolves.toEqual('nested-cmd3-output');
});

test('Calls nested toolkit command', async () => {
  await expect(exec(['cmd7'])).resolves.toEqual('nested-cmd7-output');
});

test('Rejects non existing command', async () => {
  await expect(exec(['cmd-100'])).rejects.toThrow(
    /Command "cmd-100" is not available, use --help for usage/
  );
});
