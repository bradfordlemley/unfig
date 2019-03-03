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
  const cfgFile = findFileUp(cfgFilename, rootDir);
  const pkg = findPkg(rootDir);
  const monoRepo = findMonorepo(rootDir);
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
      // console.log(`Running ${jsBin} ${cArgs.join(" ")}`)
      return (nodeArgs && nodeArgs.length
        ? execa('node', nodeArgs.concat([resolvedJsBin]).concat(cArgs), sOpts)
        : execa(jsBin, cArgs, sOpts)
      ).then(result => ({
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      }));
    },
  };

  return env;
};