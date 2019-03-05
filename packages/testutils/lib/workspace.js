//@flow strict
const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');

/*::

type ExecScript = Array<string> => Promise<{code: number}>;

*/

function createWorkspaceDir(wkspcRoot) {
  fs.mkdirsSync(path.dirname(path.resolve(wkspcRoot)));
  return fs.mkdtempSync(path.resolve(wkspcRoot));
}

function makeWorkspaceUtils(dir /* :string */) {
  return {
    dir,
    spawn: (args /* :Array<string> */) =>
      execa('unfig', args, { cwd: dir, reject: false }),
    spawnSync: (args /* :Array<string> */) =>
      execa.sync('unfig', args, { cwd: dir, reject: false }),
    execCmd: (args /* :Array<string> */) =>
      require('unfig').execCmd(['--rootDir', dir].concat(args)),
  };
}

async function initWorkspace(
  workspaceDir /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const ws = makeWorkspaceUtils(workspaceDir);
  fixtureDir && fs.copySync(fixtureDir, workspaceDir);
  const pkgFile = path.join(ws.dir, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkgJson = fs.readJsonSync(pkgFile);
    pkgJson.name = path.basename(ws.dir);
    fs.writeJsonSync(pkgFile, pkgJson);
  } else {
    fs.writeJsonSync(pkgFile, {name: path.basename(ws.dir), version: "0.0.1"});
  }
  let args = ['init', '--no-prompt'];
  if (toolkit) {
    args = args.concat(['--toolkit', toolkit]);
    args = args.concat(initArgs || []);
  }
  await ws.execCmd(args);
  return ws;
}

async function createWorkspace(
  workspaceDir /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const workspace = makeWorkspaceUtils(workspaceDir);
  let args = ['create', workspaceDir, '--no-prompt'];
  if (toolkit) {
    args = args.concat(['--toolkit', toolkit]);
  }
  await require("unfig").execCmd(args);
  fixtureDir && fs.copySync(fixtureDir, workspaceDir);
  return workspace;
}

function withWorkspaces(workspaceRoot /* :string */) {
  afterAll(async () => {
    // workspaceRoot && (await fs.emptyDir(workspaceRoot));
  });

  return {
    createWorkspace: (toolkit /* :string */, fixtureDir /* :string */ = '') => {
      const dir = createWorkspaceDir(path.join(workspaceRoot, `${path.basename(fixtureDir)}-`));
      return createWorkspace(dir, toolkit, fixtureDir)
    },
    initWorkspace: (toolkit /* :string */, fixtureDir /* :string */ = '', initArgs /* : ?$ReadOnlyArray<string> */) => {
      const dir = createWorkspaceDir(path.join(workspaceRoot, `${path.basename(fixtureDir)}-`));
      return initWorkspace(dir, toolkit, fixtureDir, initArgs)
    },
  };
}

module.exports = {
  withWorkspaces,
};
