// @flow strict
const execa = require('execa');
const fs = require('fs');
const path = require('path');
/*::

import type {CreatePlugin} from '@unfig/type-toolkit';
import type {PkgJson} from '@unfig/type-pkg-json';

export type PkgInfo = {
  pkgFile: string,
  pkgJson: PkgJson,
};

export type PluginMonorepoCfg = {|
  ignoreMissingPkgCmd?: (pkgInfo: PkgInfo, cmd: string) => boolean,
|}

*/

function usesUnifig({ pkgJson, pkgFile }, env) {
  const { devDependencies, scripts } = pkgJson;
  const unifigDevDep = devDependencies && devDependencies.unfig;
  const unifigScript = scripts && scripts.unfig;
  const unifigFile = path.join(path.dirname(pkgFile), env.cfgFilename);
  return Boolean(unifigDevDep || unifigScript || fs.existsSync(unifigFile));
}

const hasScript = ({ pkgJson }, script) =>
  pkgJson.scripts && pkgJson.scripts[script];

function makeScopeArgs(pkgs) {
  const a = [];
  pkgs.forEach(pkg => {
    a.push('--scope');
    a.push(pkg.pkgJson.name);
  });
  return a;
}

module.exports = (cfg => ({
  load: env => {
    const { pkg, monoRepo } = env;
    // only support commands in monorepo env
    if (!monoRepo || (pkg && pkg.pkgFile !== monoRepo.pkg.pkgFile)) {
      return {};
    }

    const { ignoreMissingPkgCmd } = cfg || {};
    async function runCommand(cmd, args, lernaFlags) {
      const unifigPkgsToRun = monoRepo.pkgs.filter(
        pkg => !hasScript(pkg, cmd) && usesUnifig(pkg, env)
      );
      const scriptPkgsToRun = monoRepo.pkgs.filter(pkg => hasScript(pkg, cmd));
      const pkgsWithout = monoRepo.pkgs.filter(
        pkg => !hasScript(pkg, cmd) && !usesUnifig(pkg, env)
      );
      const pkgErrs = pkgsWithout.filter(
        pkg => ignoreMissingPkgCmd == null || !ignoreMissingPkgCmd(pkg, cmd)
      );
      if (pkgErrs.length) {
        throw new Error(
          `Found packages that don't support: ${cmd}: ${pkgErrs
            .map(({ pkgFile }) => pkgFile)
            .join(' ')}`
        );
      }

      const promises = [];

      if (scriptPkgsToRun.length) {
        const lernaArgs = ['run']
          .concat(lernaFlags || [])
          .concat(makeScopeArgs(scriptPkgsToRun))
          .concat([cmd])
          .concat(args ? ['--'].concat(args) : []);
        // console.log(`lerna ${lernaArgs}`);
        promises.push(execa('lerna', lernaArgs, { stdio: 'inherit' }));
      }

      if (unifigPkgsToRun.length) {
        promises.push(
          execa(
            'lerna',
            ['exec']
              .concat(lernaFlags || [])
              .concat(makeScopeArgs(unifigPkgsToRun))
              .concat(['--', 'unfig', cmd].concat(args || [])),
            {
              stdio: 'inherit',
            }
          )
        );
      }

      await Promise.all(promises);
      return {
        code: 0,
      };
    }

    return {
      toolkits: [
        require('@unfig/toolkit-flow')(),
        require('@unfig/toolkit-jest')({
          jestCfg: () => require('./jest-cfg')(cfg, monoRepo.pkgs),
        }),
        require('@unfig/toolkit-husky')({
          huskyCfg: () => ({
            hooks: {
              'pre-commit': 'unfig pre-commit',
            },
          }),
        }),
      ],
      commands: {
        'pre-commit': {
          describe: 'Run checks',
          handler: ({ args }) =>
            // running in parralell can cause multiple git adds to occur in
            // parallel which will cause git failures.
            runCommand('pre-commit', args, ['--concurrency', '1']),
        },
        validate: {
          describe: 'Run validation on all packages in monorepo',
          handler: async () => {
            await execa('unfig', ['reflow'], { stdio: 'inherit' });
            return runCommand('validate');
          },
        },
        reset: {
          describe: 'Run command on all packages in monorepo',
          handler: async ({ env }) => {
            await env.run('lerna', ['clean', '-y']);
            return env.run('yarn');
          },
        },
        run: {
          describe: 'Run command on all packages in monorepo',
          handler: ({ args }) => runCommand(args[0], args.slice(1)),
        },
        'run-p': {
          describe: 'Run command on all packages in monorepo in parallel',
          handler: ({ args }) =>
            runCommand(args[0], args.slice(1), ['--parallel']),
        },
        start: {
          describe: 'Run command on all packages in monorepo',
          // handler: ({ args }) => runCommand('start', args, ['--parallel']),
          handler: ({ self, args }) =>
            self.execCmd('run-p', ['start'].concat(args)),
        },
        test: {
          describe: 'Run tests on all packages in monorepo',
          handler: () => runCommand('test'),
        },
      },
    };
  },
  filepath: __filename,
}) /*:CreatePlugin<?PluginMonorepoCfg> */);
