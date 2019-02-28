// @flow strict
const fs = require('fs-extra');
const path = require('path');
const findUp = require('@unfig/find-up');
const { getPkg } = require('@unfig/find-pkg');
const globby = require('globby');

/*::
import {type Pkg} from '@unfig/find-pkg';
*/

function findPkgs(
  rootPath /* :string */,
  globPatterns /* :$ReadOnlyArray<string> */
) /* :Array<string> */ {
  if (!globPatterns) {
    return [];
  }
  const globOpts = {
    cwd: rootPath,
    strict: true,
    absolute: true,
  };
  const pkgs = [];
  globPatterns.forEach(pattern => {
    pkgs.push(...globby.sync(path.join(pattern, 'package.json'), globOpts));
  });
  return pkgs.map(f => path.normalize(f));
}

function loadPackages(pkgFiles) /*:Array<Pkg> */ {
  return pkgFiles.map(pkgFile => getPkg(pkgFile));
}

const findMonorepo = (startDir /* :?string */) => {
  const mono = findUp(dir => {
    const pkgFile = path.join(dir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = getPkg(pkgFile);
      const { workspaces } = pkg.pkgJson;
      const pkgPatterns /* :?Array<string> */ =
        workspaces &&
        (Array.isArray(workspaces) ? workspaces : workspaces.packages);
      if (pkgPatterns) {
        return {
          pkg,
          pkgPatterns,
        };
      }
      if (fs.existsSync(path.join(dir, 'lerna.json'))) {
        const lernaJson = fs.readJsonSync(path.join(dir, 'lerna.json'));
        const pkgPatterns = lernaJson.packages;
        if (pkgPatterns) {
          return {
            pkg,
            lernaJson,
            pkgPatterns,
          };
        }
      }
    }
  }, startDir);
  if (!mono) {
    return;
  }
  const { pkg, pkgPatterns } = mono;
  const pkgFiles = findPkgs(path.dirname(pkg.pkgFile), pkgPatterns);
  return {
    pkg,
    pkgs: loadPackages(pkgFiles),
  };
};

module.exports = findMonorepo;
