// @flow strict
const fs = require('fs-extra');
const path = require('path');
// $ExpectError: untyped module
const maxstache = require('maxstache');
/*::

import type {CreatePlugin} from '@unfig/type-toolkit';
import type {PkgJson} from '@unfig/type-pkg-json';

export type RollupCfgPluginCfg = {|
  +extensions?: $ReadOnlyArray<string>,
  +input: string,
  +pkgJson?: ?PkgJson,
  +umdGlobals?: { [string]: string },
|};

*/

function getFiles(pkgJson /*: $ReadOnly<PkgJson> */) {
  if (!pkgJson.main) {
    throw new Error(`main missing in package.json`);
  }
  const { dir, name, ext } = path.parse(pkgJson.main);

  if (!dir) {
    throw new Error(
      `package.json main entry should include a directory, got: "${pkgJson.main ||
        ''}"`
    );
  }
  if (pkgJson.module) {
    const { dir: modDir } = path.parse(pkgJson.module);
    if (!modDir) {
      throw new Error(
        `package.json module entry should include a directory, got: "${pkgJson.module ||
          ''}"`
      );
    }
  }

  return {
    cjs: pkgJson.main || '',
    cjs_dev: `${dir}/${name}.development${ext}`,
    cjs_prod: `${dir}/${name}.production${ext}`,
    esm: pkgJson.module || '',
    umd_dev: `${dir}/${name}.umd.development${ext}`,
    umd_prod: `${dir}/${name}.umd.production${ext}`,
  };
}

function genFromFile(
  templateFile /* :string */,
  targetFile /*: string */,
  vars /*: {} */
) {
  const template = fs.readFileSync(templateFile, { encoding: 'utf-8' });
  fs.writeFileSync(targetFile, maxstache(template, vars));
}

module.exports = (cfg => {
  return {
    toolkits: [
      require('@unfig/toolkit-rollup')({
        rollupCfg: ({ env }) => {
          if (!env.pkg || !env.pkg.pkgJson) {
            throw new Error(`No pkgJson`);
          }
          return require('./rollup-config')(
            Object.assign({}, cfg, { files: getFiles(env.pkg.pkgJson) })
          );
        },
      }),
    ],
    commands: {
      rollup: {
        describe: 'Package project',
        handler: async ({ env, self }) => {
          if (!env.pkg || !env.pkg.pkgJson) {
            throw new Error(`No pkgJson`);
          }
          const files = getFiles(env.pkg.pkgJson);
          if (!env.pkg) {
            throw new Error(`Package does not have main entry`);
          }
          const cjsFile = path.join(env.pkg.pkgDir, files.cjs);
          fs.ensureDirSync(path.dirname(cjsFile));
          genFromFile(
            path.join(__dirname, '../templates/cjs-template.js'),
            cjsFile,
            {
              productionModule: files.cjs_prod,
              developmentModule: files.cjs_dev,
            }
          );
          return self.children.execCmd('rollup', ['-c']);
        },
      },
    },
    filepath: __filename,
  };
} /*: CreatePlugin<RollupCfgPluginCfg> */);
