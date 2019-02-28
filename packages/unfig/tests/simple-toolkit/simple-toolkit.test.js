const fs = require('fs-extra');
const path = require('path');

const { verifyDir } = require('@unfig/testutils');

const unfig = require('../../lib');

const exec = args => unfig.execCmd(['--rootDir', __dirname].concat(args));

test('gets cfg modules from toolkit', () => {
  expect(unfig.getCfg(path.join(__dirname, '.config1.js'))).toEqual('config1');
  expect(unfig.getCfg(path.join(__dirname, 'config2.js'))).toEqual('config2');
  expect(unfig.getCfg(path.join(__dirname, 'config3.js'))).toEqual('config3');
});

test('throws on unhandled file', () => {
  expect(() => unfig.getCfg(path.join(__dirname, '.config100.js'))).toThrow(
    /File .config100.js .+ is not supported/
  );
});

test('executes commands from toolkit', async () => {
  const result = await exec(['test']);
  expect(result).toEqual('this is a test');

  const result2 = await exec(['build']);
  expect(result2).toEqual('this is a build');

  const result3 = await exec(['command3']);
  expect(result3).toEqual('command3');
});

test('Plugin calls run to execute another unfig command', async () => {
  await expect(exec(['cmdA'])).resolves.toMatchObject({
    code: 0,
    stdout: 'CmdB-message',
  });
});

test('Failed call to run bubbles up as error', async () => {
  let error = null;
  await exec(['cmdC']).catch(err => {
    error = err;
  });
  expect(error).toMatchObject({
    code: 2,
    stdout: '',
  });
  expect(error.stderr).toMatch(/Error: cmdD-throw-message/);
});

test('inits toolkit', async () => {
  const testDir = path.join(__dirname, '../../../test-workspaces/plugintest');
  await fs.emptyDir(testDir);
  fs.writeJsonSync(path.join(testDir, 'package.json'), { name: 'testpkg' });
  await unfig.execCmd([
    '--rootDir',
    testDir,
    'init',
    '--toolkit',
    path.join(__dirname, './simple-toolkit'),
    '--unfig-module',
    path.join(__dirname, '../../lib'),
  ]);

  const result = await unfig.execCmd(['--rootDir', testDir, 'test']);
  expect(result).toEqual('this is a test');

  const result2 = await unfig.execCmd(['--rootDir', testDir, 'build']);
  expect(result2).toEqual('this is a build');

  const result3 = await unfig.execCmd(['--rootDir', testDir, 'command3']);
  expect(result3).toEqual('command3');

  expect(require(path.join(testDir, '.config1.js'))).toEqual('config1');
  expect(require(path.join(testDir, 'config2.js'))).toEqual('config2');
  expect(require(path.join(testDir, 'config3.js'))).toEqual('config3');
  verifyDir(testDir, [
    '.config1.js',
    '.unfig.js',
    'config2.js',
    'config3.js',
    'package.json',
  ]);
});

test('Throws on unhandled command', async () => {
  await expect(exec(['command-x'])).rejects.toThrow(
    /Command "command-x" is not available/
  );
});

test('Throws on no args', async () => {
  await expect(exec([])).rejects.toThrow(/No command found in/);
});

test('Throws on args, but no command', async () => {
  await expect(exec(['--fruit'])).rejects.toThrow(
    /Unrecognized global arg: --fruit/
  );
});

test('Throws on non-Array args', async () => {
  await expect(unfig.execCmd('command')).rejects.toThrow(/Args must be array/);
});
