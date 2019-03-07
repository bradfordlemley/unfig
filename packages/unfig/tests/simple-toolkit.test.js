const path = require('path');
const unfig = require('../lib');
// eslint-disable-next-line node/no-unpublished-require
const { verifyDir, withInitWorkspace } = require('@unfig/testutils');

const toolkitPath = path.resolve(__dirname, "simple-toolkit/simple-toolkit");

let ws = null;
withInitWorkspace(
  w => ws = w,
  path.resolve(__dirname, '../__test-wkspcs__/simple-toolkit-'),
  toolkitPath,
  "",
  ["--no-install"]
);

test('toolkit includes dependencies', async () => {
  const { dir } = ws;
  const toolkit = unfig.loadToolkit(dir);
  expect(toolkit.toolDependencies).toEqual({
    eslint: {
      toolkit: `${toolkitPath}.js`,
      version: "5.10.0",
    }
  })
});

test('creates files', async () => {
  const { dir } = ws;
  verifyDir(dir, [
    '.config1.js',
    '.unfig.js',
    'config2.js',
    'config3.js',
    'package.json',
  ]);
});

test('gets cfg modules from toolkit', () => {
  const { dir } = ws;
  expect(unfig.getCfg(path.join(dir, '.config1.js'))).toEqual('config1');
  expect(unfig.getCfg(path.join(dir, 'config2.js'))).toEqual('config2');
  expect(unfig.getCfg(path.join(dir, 'config3.js'))).toEqual('config3');
});

test('gets cfg modules from file system', () => {
  const { dir } = ws;
  expect(require(path.join(dir, '.config1.js'))).toEqual('config1');
  expect(require(path.join(dir, 'config2.js'))).toEqual('config2');
  expect(require(path.join(dir, 'config3.js'))).toEqual('config3');
});

test('throws on unhandled file', () => {
  const { dir } = ws;
  expect(() => unfig.getCfg(path.join(dir, '.config100.js'))).toThrow(
    /File .config100.js .+ is not supported/
  );

  expect(() => require(path.join(dir, '.config100.js'))).toThrow(
    /Cannot find module/
  );
});

test('executes commands from toolkit', async () => {
  const { execCmd } = ws;
  const result = await execCmd(['test']);
  expect(result).toEqual('this is a test');

  const result2 = await execCmd(['build']);
  expect(result2).toEqual('this is a build');

  const result3 = await execCmd(['command3']);
  expect(result3).toEqual('command3');
});

test('Toolkit calls run to execute another unfig command', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['cmdA'])).resolves.toMatchObject({
    code: 0,
    stdout: 'CmdB-message',
  });
});

test('Failed call to run bubbles up as error', async () => {
  const { execCmd } = ws;
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

// test('inits dependencies', async () => {
//   const { dir } = ws;
//   const pkgJson = fs.readJsonSync(path.join(dir, 'package.json'));
//   expect(pkgJson.devDependencies).toMatchObject({
//     eslint: "5.10.0"
//   });
// });

test('Toolkit', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['command-x'])).rejects.toThrow(
    /Command "command-x" is not available/
  );
});

test('Throws on unhandled command', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['command-x'])).rejects.toThrow(
    /Command "command-x" is not available/
  );
});

test('Throws on no args', async () => {
  const { execCmd } = ws;
  await expect(execCmd([])).rejects.toThrow(/No command found in/);
});

test('Throws on args, but no command', async () => {
  const { execCmd } = ws;
  await expect(execCmd(['--fruit'])).rejects.toThrow(
    /Unrecognized global arg: --fruit/
  );
});
