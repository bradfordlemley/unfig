//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type TypescriptPluginCfg = {|
  +exclude?: $ReadOnlyArray<string>,
  +include?: $ReadOnlyArray<string>,
  jsx?: string,
  outDir: string,
  target?: string,
|}

*/

module.exports = (cfg => {
  const { exclude, jsx, include, outDir, target } = cfg || {};
  return {
    toolDependencies: true,
    jsonFiles: {
      // typecheck options; includes all files, ie. typecheck src + tests
      "tsconfig.json": () => ({
        compilerOptions: {
          alwaysStrict: true,
          declaration: true,
          esModuleInterop: true,
          jsx: jsx || "react",
          moduleResolution: "node",
          noFallthroughCasesInSwitch: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noImplicitThis: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          outDir,
          sourceMap: true,
          strict: true,
          strictFunctionTypes: true,
          strictNullChecks: true,
          strictPropertyInitialization: true,
          target: target || "ES2017"
        }
      }),
      // includes only src files
      "tsconfig-build.json": () => ({
        extends: "./tsconfig.json",
        include,
        exclude
      })
    },
    commands: {
      tsc: {
        describe: "tsc build",
        handler: ({ env, args }) =>
          env.run("tsc", ["-p", "tsconfig-build.json"].concat(args))
      },
      tscDefs: {
        describe: "build type defs",
        handler: ({ env, args }) =>
          env.run(
            "tsc",
            ["-p", "tsconfig-build.json", "-d", "--emitDeclarationOnly"].concat(
              args
            )
          )
      },
      tscCheck: {
        describe: "run typescript checker",
        handler: ({ env, args }) => env.run("tsc", ["--noEmit"].concat(args))
      }
    },
    filepath: __filename
  };
} /*:CreatePlugin<?TypescriptPluginCfg> */);
