// @flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type EslintPluginCfg = {|
  eslintCfg?: () => {},
  dirs?: $ReadOnlyArray<string>,
  exts?: $ReadOnlyArray<string>,
  ignoreDirs?: $ReadOnlyArray<string>,
|}

*/

module.exports = (cfg => {
  const { eslintCfg, ignoreDirs, exts, dirs } = cfg || {};
  return {
    commands: {
      eslint: {
        describe: "Lint with eslint",
        handler: ({ env, args }) => {
          const lintArgs = [];
          ignoreDirs &&
            ignoreDirs.map(dir =>
              lintArgs.push("--ignore-pattern", `${dir}/**`)
            );
          exts && exts.map(ext => lintArgs.push("--ext", `.${ext}`));
          // allDirs
          //   .filter(dir => fs.existsSync(path.resolve(dir)))
          //   .map(dir => lintArgs.push(dir));
          args && lintArgs.push(...args);
          dirs && lintArgs.push(...dirs);
          return env.run("eslint", lintArgs);
        }
      }
    },
    dependencies: {
      eslint: "",
    },
    modules: {
      ".eslintrc.js": eslintCfg
    },
    filepath: __filename
  };
} /*: CreatePlugin<EslintPluginCfg> */);
