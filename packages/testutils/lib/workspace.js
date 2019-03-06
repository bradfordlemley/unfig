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

async function initWorkspace(
  workspaceRoot /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const dir = createWorkspaceDir(workspaceRoot);
  const ws = makeWorkspaceUtils(dir);
  fixtureDir && fs.copySync(fixtureDir, dir);
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

async function createWorkspace(
  workspaceRoot /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  const dir = createWorkspaceDir(workspaceRoot)
  const ws = makeWorkspaceUtils(dir);

  const args = ['create', dir]
    .concat(toolkit ? ['--toolkit', toolkit]: []);

  await ws.execCmd(args);
  fixtureDir && fs.copySync(fixtureDir, dir);
  return ws;
}

function withInitWorkspace(
  setWs,
  workspaceRoot /* :string */,
  toolkit /* :?string */,
  fixtureDir /* :?string */,
  initArgs /* : ?$ReadOnlyArray<string> */,
) /*  Promise<{ exec: any, execSync: any, cmd: any, dir: string }> */ {
  let w;
  beforeAll(async () => {
    w = await initWorkspace(workspaceRoot, toolkit, fixtureDir, initArgs);
    setWs(w)
    // await execa('yarn', {cwd: ws.dir});
  }, 30000);
  
  afterAll(async () => w.clean())
}

// function withWorkspace(workspaceRoot /* :string */) {
//   afterAll(async () => {
//     workspaceRoot && (await fs.emptyDir(workspaceRoot));
//   });

//   const dir = createWorkspaceDir(workspaceRoot);

//   return {
//     createWorkspace: (toolkit /* :string */, fixtureDir /* :string */ = '') => {
//       return createWorkspace(dir, toolkit, fixtureDir)
//     },
//     initWorkspace: (toolkit /* :string */, fixtureDir /* :string */ = '', initArgs /* : ?$ReadOnlyArray<string> */) => {
//       return initWorkspace(dir, toolkit, fixtureDir, initArgs)
//     },
//   };
// }

module.exports = {
  createWorkspace,
  initWorkspace,
  withInitWorkspace,
};
