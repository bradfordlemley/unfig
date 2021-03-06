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

function getFiles(pkgJson /*: $ReadOnly<PkgJson> */, pkgFile /*: string */) {
  if (!pkgJson.main) {
    throw new Error(`main missing in package.json: ${pkgFile}`);
  }
  if (!pkgJson.module) {
    throw new Error(`module missing in package.json: ${pkgFile}`);
  }
  const { dir, name, ext } = path.parse(pkgJson.main);

  if (!dir) {
    throw new Error(
      `package.json main entry should include a directory, got: "${pkgJson.main ||
        ''}": : ${pkgFile}`
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
          if (!cfg.input) {
            throw new Error(`No input in cfg: ${JSON.stringify(cfg, null, 2)}`);
          }
          return require('./rollup-config')(
            Object.assign({}, cfg, {
              files: getFiles(env.pkg.pkgJson, env.pkg.pkgFile),
            })
          );
        },
      }),
    ],
    commands: {
      build: {
        describe: 'Package project',
        handler: async ({ env, self, args }) => {
          if (!env.pkg || !env.pkg.pkgJson) {
            throw new Error(`No pkgJson`);
          }
          if (!cfg.input) {
            throw new Error(`No input in cfg: ${JSON.stringify(cfg, null, 2)}`);
          }
          const files = getFiles(env.pkg.pkgJson, env.pkg.pkgFile);
          if (!env.pkg) {
            throw new Error(`Package does not have main entry`);
          }
          const cjsFile = path.join(env.pkg.pkgDir, files.cjs);
          fs.ensureDirSync(path.dirname(cjsFile));
          genFromFile(
            path.join(__dirname, '../templates/cjs-template.js'),
            cjsFile,
            {
              productionModule: `./${path.relative(
                path.dirname(files.cjs),
                files.cjs_prod
              )}`,
              developmentModule: `./${path.relative(
                path.dirname(files.cjs),
                files.cjs_dev
              )}`,
            }
          );
          return self.children.execCmd('rollup', ['-c'].concat(args));
        },
      },
      start: {
        describe: 'Package project watch',
        handler: ({ args, self }) => self.execCmd('build', ['-w'].concat(args)),
      },
    },
    filepath: __filename,
  };
} /*: CreatePlugin<RollupCfgPluginCfg> */);
