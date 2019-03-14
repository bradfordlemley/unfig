// @flow strict

const stdcfg = require('@unfig/stdprj-config');
const makeJestCfg = require('./jest-config');

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';
import type {EslintPluginCfg} from '@unfig/toolkit-eslint';
import type {StdPrjUserCfg} from '@unfig/stdprj-config';

export type StdPrjPluginCfg = {|
  ...StdPrjUserCfg,
  babelCfg?: () => {},
  eslintCfg?: () => {},
  rollupCfg?: () => {},
  noTest?: boolean,
  umdGlobals?: { [string]: string },
|}

*/

module.exports = (cfg => ({
  load: env => {
    const { babelCfg, eslintCfg, noTest, umdGlobals, ...rest } = cfg || {};
    // $ExpectError: inexact type not compatible with exact
    const stdCfg = stdcfg.getCfg(rest, env.pkg.pkgDir);
    const { ignoreDirs } = stdCfg;

    return {
      toolkits: [
        require('@unfig/toolkit-eslint')({
          dirs: [stdCfg.srcDir].concat(stdCfg.testDir || []),
          exts: stdCfg.jsSrcExts,
          ignoreDirs,
          eslintCfg: eslintCfg,
        }),
        require('@unfig/toolkit-babel')({
          srcDir: stdCfg.srcDir,
          outDir: stdCfg.publishDir,
          exts: stdCfg.jsSrcExts,
          ignorePatterns: stdCfg.ignoreDirs.concat(stdCfg.testFilePatterns),
          babelCfg: babelCfg,
        }),
        !noTest &&
          require('@unfig/toolkit-jest')({
            jestCfg: ({ requestFile }) => makeJestCfg(stdCfg, requestFile),
          }),
        require('@unfig/toolkit-typescript')({
          include: [`${stdCfg.srcDir}/**/*`],
          exclude: stdCfg.srcDirTestFilePatterns.concat(['**/node_modules/**']),
          outDir: stdCfg.publishDir,
        }),
        require('@unfig/toolkit-flow')(),
        require('@unfig/toolkit-prettier')({
          prettierCfg: () => require('./prettier-cfg'),
        }),
        require('@unfig/toolkit-lint-staged')({
          lintStagedCfg: () => require('./lint-staged.config')(stdCfg),
        }),
        require('@unfig/toolkit-rollup-stdlib')({
          extensions: stdCfg.jsSrcExts,
          input: stdCfg.entry,
          pkgJson: env.pkg && env.pkg.pkgJson,
          umdGlobals,
        }),
      ],
      commands: {
        build: {
          describe: 'Build your project',
          handler: async ({ args, self }) => {
            await self.children.execCmd('build', args);
            return self.children.execCmd('tscDefs');
          },
        },
        start: {
          describe: 'Build your project',
          handler: async ({ args, self }) => {
            return Promise.all([
              self.children.execCmd('start', args),
              self.children.execCmd('tscDefs', [
                '-w',
                '--preserveWatchOutput',
                '--listEmittedFiles',
              ]),
            ]).then(() => ({ code: 0 }));
          },
        },
        lint: {
          describe: 'Lint your project',
          handler: ({ args, self }) => self.children.execCmd('eslint', args),
        },
        test: {
          describe: 'Test your project',
          handler: ({ args, self }) => self.children.execCmd('jest', args),
        },
        'test:debug': {
          describe: 'Test your project',
          handler: ({ args, self }) =>
            self.children.execCmd('jest:debug', args),
        },
        validate: {
          describe: 'Validate your project',
          handler: async ({ self }) => {
            await self.execCmd('lint');
            await self.execCmd('test');
            return self.children.execCmd('flow');
          },
        },
        'pre-commit': {
          describe: 'Check staged files',
          handler: ({ self, args }) =>
            self.children.execCmd('lint-staged', args),
        },
      },
    };
  },
  filepath: __filename,
}) /*:CreatePlugin<?StdPrjPluginCfg> */);
