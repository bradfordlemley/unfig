//@flow strict
const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');

/*::

type ExecScript = Array<string> => Promise<{code: number}>;

*/

function createWorkspace(
  wkspcDir /* :string */,
  cmdCliBin /* :?string */,
  cmdScript /* :?ExecScript */
) {
  const cliBin = cmdCliBin || 'unfig';
  const cmdMain =
    cmdScript ||
    // $ExpectError: not flow strict
    require('unfig').execCmd;
  fs.mkdirsSync(path.dirname(path.resolve(wkspcDir)));
  const dir = fs.mkdtempSync(path.resolve(wkspcDir));
  const execSync = (args /* :Array<string> */) =>
    execa.sync(cliBin, args, { cwd: dir, reject: false });
  const exec = (args /* :Array<string> */) =>
    execa(cliBin, args, { cwd: dir, reject: false });
  const cmd = (args /* :Array<string> */) =>
    cmdMain(['--rootDir', dir].concat(args));
  return {
    dir,
    exec,
    execSync,
    cmd,
  };
}

async function initFixture(
  fixtureDir /* :string */,
  toolkit /* :string */,
  workspace,
  cfgMod /* :?string */
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const { dir, cmd, exec, execSync } = workspace;
  dir && fs.copySync(fixtureDir, dir);
  const cfgModArgs = cfgMod ? ['--cfgMod', cfgMod] : [];
  await cmd(
    ['init'].concat(cfgModArgs).concat(['--toolkit', toolkit, '--no-prompt'])
  );
  return {
    dir,
    exec,
    execSync,
    cmd,
  };
}

function withWorkspaces(root /* :string */) {
  afterAll(async () => {
    root && (await fs.emptyDir(root));
  });

  return async function create(
    fixtureDir /* :string */ = '',
    toolkit /* :string */
  ) {
    const workspace = createWorkspace(
      path.join(root, `${path.basename(fixtureDir)}-`)
    );
    if (fixtureDir) {
      await initFixture(fixtureDir, toolkit, workspace);
    }
    return workspace;
  };
}

module.exports = {
  createWorkspace,
  withWorkspaces,
};
