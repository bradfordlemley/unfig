//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type TypescriptPluginCfg = {|
  +exclude?: $ReadOnlyArray<string>,
  +include?: $ReadOnlyArray<string>,
  outDir: string,
|}

*/

module.exports = (cfg => {
  const { include, exclude, outDir } = cfg || {};
  return {
    toolDependencies: true,
    jsonFiles: {
      "tsconfig.json": () => ({ include, exclude, compilerOptions: { outDir } })
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
            ["-d", "--emitDeclarationOnly", "--jsx", "react"].concat(args)
          );
        }
      }
    },
    filepath: __filename
  };
} /*:CreatePlugin<?TypescriptPluginCfg> */);
