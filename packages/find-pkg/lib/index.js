// @flow strict
const fs = require("fs-extra");
const path = require("path");
const { findFileUp } = require("@unfig/find-up");

/*::

import {type PkgJson} from '@unfig/type-pkg-json';

export type Pkg = {|
  pkgDir: string,
  pkgFile: string,
  pkgJson: PkgJson,
|}
*/

module.exports = (startDir /*:?string */) /* :?Pkg */ => {
  const pkgFile = findFileUp("package.json", startDir);
  if (pkgFile == null || pkgFile == "") {
    return;
  }

  return module.exports.getPkg(pkgFile);
};

module.exports.getPkg = (pkgFile /* :string */) /* :Pkg */ => ({
  pkgJson: (fs.readJsonSync(pkgFile) /*:PkgJson */),
  pkgDir: path.dirname(pkgFile),
  pkgFile
});
