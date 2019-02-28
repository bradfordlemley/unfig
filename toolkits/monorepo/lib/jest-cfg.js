//@flow strict

/*::
import {type PkgInfo, type PluginMonorepoCfg } from './';
*/

const fs = require('fs');
const path = require('path');

module.exports = (
  cfg /* :?PluginMonorepoCfg */,
  pkgs /* :$ReadOnlyArray<PkgInfo> */
) => {
  const pkgsWithJest = pkgs.filter(({ pkgFile }) =>
    fs.existsSync(path.join(path.dirname(pkgFile), 'jest.config.js'))
  );
  return {
    projects: pkgsWithJest.map(({ pkgFile }) =>
      path.join(path.dirname(pkgFile))
    ),
  };
};
