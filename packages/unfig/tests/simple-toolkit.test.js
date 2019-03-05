const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const unfig = require('../lib');
const { verifyDir, withWorkspaces } = require('@unfig/testutils');

const { createWorkspace } = withWorkspaces(
  path.resolve(__dirname, '../../../__test-wkspcs__/simple-toolkit')
);

let ws = null, execCmd = null, dir = null;
beforeAll(async () => {
  ws = await createWorkspace(
    path.resolve(__dirname, "simple-toolkit/simple-toolkit")
  );
  await execa('yarn', {cwd: ws.dir});
  ({execCmd, dir} = ws);
}, 30000);


test('uses unfig from monorepo', async () => {
  if (fs.existsSync(path.join(dir, 'node_modules', 'unfig'))) {
    throw new Error(`Unfig exists in ${dir}/node_modules`)
  }
});

test('creates files', async () => {
  verifyDir(dir, [
    '.config1.js',
    '.unfig.js',
    'config2.js',
    'config3.js',
    'node_modules',
    'package.json',
  ]);
});

test('gets cfg modules from toolkit', () => {
  expect(unfig.getCfg(path.join(dir, '.config1.js'))).toEqual('config1');
  expect(require(path.join(dir, '.config1.js'))).toEqual('config1');
  expect(unfig.getCfg(path.join(dir, 'config2.js'))).toEqual('config2');
  expect(require(path.join(dir, 'config2.js'))).toEqual('config2');
  expect(unfig.getCfg(path.join(dir, 'config3.js'))).toEqual('config3');
  expect(require(path.join(dir, 'config3.js'))).toEqual('config3');
});

test('throws on unhandled file', () => {
  expect(() => unfig.getCfg(path.join(dir, '.config100.js'))).toThrow(
    /File .config100.js .+ is not supported/
  );

  expect(() => require(path.join(dir, '.config100.js'))).toThrow(
    /Cannot find module/
  );
});

test('executes commands from toolkit', async () => {
  const result = await execCmd(['test']);
  expect(result).toEqual('this is a test');

  const result2 = await execCmd(['build']);
  expect(result2).toEqual('this is a build');

  const result3 = await execCmd(['command3']);
  expect(result3).toEqual('command3');
});

test('Toolkit calls run to execute another unfig command', async () => {
  await expect(execCmd(['cmdA'])).resolves.toMatchObject({
    code: 0,
    stdout: 'CmdB-message',
  });
});

test('Failed call to run bubbles up as error', async () => {
  let error = null;
  await execCmd(['cmdC']).catch(err => {
    error = err;
  });
  expect(error).toMatchObject({
    code: 2,
    stdout: '',
  });
  expect(error.stderr).toMatch(/Error: cmdD-throw-message/);
});

test('inits dependencies', async () => {

  const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
  expect(pkgJson.devDependencies).toMatchObject({
    eslint: "5.10.0"
  });
});

test('Throws on unhandled command', async () => {
  await expect(execCmd(['command-x'])).rejects.toThrow(
    /Command "command-x" is not available/
  );
});

test('Throws on no args', async () => {
  await expect(execCmd([])).rejects.toThrow(/No command found in/);
});

test('Throws on args, but no command', async () => {
  await expect(execCmd(['--fruit'])).rejects.toThrow(
    /Unrecognized global arg: --fruit/
  );
});
