//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

type BabelPluginCfg = {|
  babelCfg?: () => {},
  exts?: $ReadOnlyArray<string>,
  ignorePatterns: $ReadOnlyArray<string>,
  outDir: string,
  srcDir: string,
|};

*/

module.exports = (cfg => {
  const { babelCfg, srcDir, outDir, ignorePatterns, exts } = cfg || {};
  return {
    modules: {
      '.babelrc.js': babelCfg,
    },
    commands: {
      babel: {
        describe: 'Transpile with babel',
        handler: ({ args, env }) => {
          const babelArgs = ['--source-maps'];

          ignorePatterns &&
            ignorePatterns.map(patt => babelArgs.push('--ignore', patt));

          exts &&
            babelArgs.push(
              '--extensions',
              exts.map(ext => `.${ext}`).join(',')
            );

          babelArgs.push('--out-dir', outDir);
          // if (cfg.publishDir === '.' || cfg.publishDir.startsWith('..')) {
          //   throw new Error(`Publish dir ${cfg.publishDir} not ok`);
          // }
          // fs.emptyDirSync(path.resolve(argv.rootDir || '', cfg.publishDir));
          babelArgs.push(srcDir);

          return env.run('babel', babelArgs.concat(args));
        },
      },
    },
    filepath: __filename,
  };
} /*:CreatePlugin<BabelPluginCfg> */);
