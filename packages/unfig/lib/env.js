// @flow strict

/*::

import type {EnvType} from '@unfig/type-toolkit';

*/

const execa = require('execa');
const path = require('path');
const which = require('npm-which');
const findMonorepo = require('@unfig/find-monorepo');
const findPkg = require('@unfig/find-pkg');
const { findFileUp } = require('@unfig/find-up');

module.exports = (
  rootDir /*: string */,
  globalArgs /*:?$ReadOnlyArray<string> */
) /*: EnvType */ => {
  const cfgFilename = '.unfig.js';
  const gArgs = globalArgs || [];
  const pkg = findPkg(rootDir);
  let cfgFile = findFileUp(cfgFilename, rootDir);
  if (cfgFile && pkg && !cfgFile.startsWith(path.dirname(pkg.pkgDir))) {
    cfgFile = null;
  }
  const monoRepo = findMonorepo(rootDir);
  const isMonorepoPkg = monoRepo && pkg && pkg.pkgFile === monoRepo.pkg.pkgFile;

  const cfg =
    cfgFile != null ? { cfgFile, cfgDir: path.dirname(cfgFile) } : undefined;
  const env = {
    cfgFilename,
    origCwd: process.cwd(),
    rootDir,
    cfg,
    pkg,
    monoRepo,
    gArgs,
    run: async (jsBin, jsBinArgs, opts = {}) => {
      const GNODE_ARGS = ['--inspect-brk', '--inspect'];
      const nodeArgs = gArgs.filter(gArg => GNODE_ARGS.includes(gArg));
      opts && opts.nodeArgs && nodeArgs.push(...opts.nodeArgs);
      const cArgs = jsBinArgs != null ? jsBinArgs : [];
      const resolvedJsBin = which(rootDir).sync(jsBin);
      const sOpts = {
        stdio: 'inherit',
        cwd: rootDir,
        ...opts,
      };
      // console.log(`Running ${jsBin} ${cArgs.join(" ")}`);
      // console.log(`resolved: ${resolvedJsBin}`)
      return (nodeArgs && nodeArgs.length
        ? execa('node', nodeArgs.concat([resolvedJsBin]).concat(cArgs), sOpts)
        : execa(resolvedJsBin, cArgs, sOpts)
      ).then(result => ({
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      }));
    },
    installDevDeps: async deps => {
      const xArgs = isMonorepoPkg ? ['-W'] : [];
      return env.run('yarn', ['add', '--dev'].concat(xArgs).concat(deps));
    },
  };

  return env;
};
