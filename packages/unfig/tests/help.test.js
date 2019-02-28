//@flow
const execa = require('execa');
const path = require('path');

const { execCmd } = require('../lib');

const execScript = args =>
  execa(path.resolve(__dirname, '../lib/cli.js'), args);

function verifyHelpOutput(output) {
  expect(output).toMatch(/^Usage:\s+\S+\s+<command>/);
  expect(output).toMatch(/\nCommands:/);
  expect(output).toMatch(/\nGlobal Options:/);
  expect(output).toMatch(/\nOptions:/);
}

async function verifyHelpCmd(args) {
  const out = await execScript(args);
  verifyHelpOutput(out.stdout);
}

test('Shows help on --help', () => verifyHelpCmd(['--help']));
test('Shows help on help', () => verifyHelpCmd(['help']));

test('Shows help', async () => {
  const result = await execCmd(['help']);
  expect(result).not.toBeNull();
  result != null && verifyHelpOutput(result.msg);
});

test('Throws on no command', async () => {
  let error = null;
  await execScript([]).catch(err => {
    error = err;
  });
  if (error == null) {
    throw new Error(`Unexpected, did not get error`);
  }
  expect(error.code).toEqual(2);
  expect(error.message).toMatch(/^Command failed/);
});

test('Throws on bad command', async () => {
  let result = null;
  await execScript(['bad']).catch(err => {
    result = err;
  });
  if (result == null) {
    throw new Error('Unexpected null');
  }
  expect(result.code).toEqual(2);
  expect(result.message).toMatch(/^Command failed/);
});

test('Shows help for init --help', async () => {
  const out = await execScript(['init', '--help']);
  expect(out.code).toEqual(0);
  expect(out.stdout).toMatch(/init/);
  expect(out.stdout).toMatch(/\n\s+--type/);
  expect(out.stdout).toMatch(/\n\s+--force/);
  expect(out.stdout).toMatch(/\n\s+--no-prompt/);
  expect(out.stdout).toMatch(/\n\s+--help/);
});
