//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type TypescriptPluginCfg = {|
  +exclude?: $ReadOnlyArray<string>,
  +include?: $ReadOnlyArray<string>,
  jsx?: string,
  outDir: string,
|}

*/

module.exports = (cfg => {
  const { exclude, jsx, include, outDir } = cfg || {};
  return {
    toolDependencies: true,
    jsonFiles: {
      "tsconfig.json": () => ({
        include,
        exclude,
        compilerOptions: {
          outDir,
          jsx: jsx || "react"
        }
      })
    },
    commands: {
      tsc: {
        describe: "tsc build",
        handler: ({ env, args }) => env.run("tsc", args)
      },
      tscDefs: {
        describe: "build type defs",
        handler: ({ args, self }) => {
          return self.execCmd(
            "tsc",
            ["-d", "--emitDeclarationOnly"].concat(args)
          );
        }
      },
      tscCheck: {
        describe: "run typescript checker",
        handler: ({ args, self }) => {
          return self.execCmd("tsc", ["--noEmit"].concat(args));
        }
      }
    },
    filepath: __filename
  };
} /*:CreatePlugin<?TypescriptPluginCfg> */);
