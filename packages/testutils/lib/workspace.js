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
    clean: () => fs.removeSync(dir),
    dir,
    spawn: (args /* :Array<string> */) =>
      execa('unfig', args, { cwd: dir, reject: false }),
    spawnSync: (args /* :Array<string> */) =>
      execa.sync('unfig', args, { cwd: dir, reject: false }),
    execCmd: (args /* :Array<string> */) =>
      // $ExpectError: not flow strict
      require('unfig').execCmd(['--rootDir', dir].concat(args)),
  };
}

async function init(
  workspaceDir /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const ws = makeWorkspaceUtils(workspaceDir);
  fixtureDir && fs.copySync(fixtureDir, ws.dir);
  const pkgFile = path.join(ws.dir, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkgJson = fs.readJsonSync(pkgFile);
    pkgJson.name = path.basename(ws.dir);
    pkgJson.version = pkgJson.version || "0.0.1";
    fs.writeJsonSync(pkgFile, pkgJson);
  } else {
    fs.writeJsonSync(pkgFile, {name: path.basename(ws.dir), version: "0.0.1"});
  }
  const args = ['init']
    .concat(toolkit ? ['--toolkit', toolkit] : [])
    .concat(initArgs || []);
  await ws.execCmd(args);
  return ws;
}

async function create(
  workspaceRoot /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const dir = createWorkspaceDir(workspaceRoot)
  const ws = makeWorkspaceUtils(dir);

  const args = ['create', dir]
    .concat(toolkit ? ['--toolkit', toolkit]: [])
    .concat(initArgs || []);

  await ws.execCmd(args);
  fixtureDir && fs.copySync(fixtureDir, dir);
  return ws;
}

function createWorkspace(workspaceRoot /* :string */) {
  const dir = createWorkspaceDir(workspaceRoot);
  const ws = makeWorkspaceUtils(dir);
  return {
    ...ws,
    init: (toolkit /* :?string */, fixtureDir /* :?string */, initArgs /* : ?$ReadOnlyArray<string> */) => 
      init(ws.dir, toolkit, fixtureDir, initArgs),
    create: (toolkit /* :?string */, fixtureDir /* :?string */, initArgs /* : ?$ReadOnlyArray<string> */) => 
      create(ws.dir, toolkit, fixtureDir, initArgs)
  }
}

async function withWorkspace(
  workspaceRoot /* :string */,
  setWs /*: (any) => any */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  let ws;

  beforeAll(async () => {
    ws = createWorkspace(workspaceRoot);
    await setWs(ws);
  }, 30000);
  
  afterAll(() => ws && ws.clean());

}

async function withInitWorkspace(
  setWs /*: (any) => any */,
  workspaceRoot /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  withWorkspace(workspaceRoot, async (ws) => {
    await ws.init(toolkit, fixtureDir, initArgs);
    await setWs(ws);
  })
}

module.exports = {
  createWorkspace,
  withInitWorkspace,
  withWorkspace,
};
