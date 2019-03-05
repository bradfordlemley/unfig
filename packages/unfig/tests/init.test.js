const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const { verifyDir } = require('@unfig/testutils');

const testPkgs = path.resolve(__dirname, '../../../__test-wkspcs__');
const unfigBin = path.resolve(__dirname, '../lib/cli.js');
const simplePlugin = path.resolve(
  __dirname,
  './simple-toolkit/simple-toolkit.js'
);
let workspaceDir = null;

beforeEach(() => {
  fs.ensureDirSync(`${testPkgs}/init/`);
  workspaceDir = fs.mkdtempSync(`${testPkgs}/init/`);
});
afterEach(() => {
  // workspaceDir && fs.removeSync(workspaceDir);
});

function readuntil(stream, predicate, timeoutMs = 5000) {
  return new Promise(resolve => {
    let output = null;
    let timeout = setTimeout(() => resolve(output), timeoutMs);
    function onData(data) {
      output = output ? output.concat(data) : data;
      if (
        (predicate.test && predicate.test(output)) ||
        (typeof predicate === 'string' && output.indexOf(predicate) != -1) ||
        (typeof predicate === 'function' && predicate(output))
      ) {
        clearTimeout(timeout);
        stream.removeListener('data', onData);
        resolve(output);
      }
    }
    stream.on('data', onData);
  });
}

test('init asks for toolkit input', async () => {
  fs.writeJsonSync(path.join(workspaceDir, 'package.json'), {
    name: path.basename(workspaceDir),
    version: "0.0.1",
  });
  const proc = execa(unfigBin, ['init'], { cwd: workspaceDir });
  proc.stdout.setEncoding('utf-8');
  const regex = /Enter toolkit/;
  const output = await readuntil(proc.stdout, regex);
  expect(output).toMatch(regex);
  proc.stdin.write(`${simplePlugin}\n`);
  await proc;
  verifyDir(workspaceDir, [
    '.config1.js',
    '.unfig.js',
    'config2.js',
    'config3.js',
    'node_modules',
    'package.json',
  ]);
});
