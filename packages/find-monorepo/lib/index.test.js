//@flow
const fs = require('fs-extra');
const path = require('path');
const findMonorepo = require('.');

test('yarn-ws', () => {
  const startDir = path.resolve(__dirname, '../fixtures/yarn-ws');
  const monoDir = startDir;
  const pkgFiles = [
    path.join(monoDir, 'packages/pkg1/package.json'),
    path.join(monoDir, 'packages/pkg2/package.json'),
  ];

  const expected = {
    pkg: {
      pkgFile: path.join(monoDir, 'package.json'),
      pkgDir: monoDir,
      pkgJson: fs.readJsonSync(path.join(monoDir, 'package.json')),
    },
    pkgs: pkgFiles.map(pkgFile => ({
      pkgFile,
      pkgDir: path.dirname(pkgFile),
      pkgJson: fs.readJsonSync(pkgFile),
    })),
  };

  expect(findMonorepo(startDir)).toEqual(expected);
});
