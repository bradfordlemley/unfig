// @flow strict

/*::

import type {CreatePlugin, GetModuleHandler} from '@unfig/type-toolkit';

import type {RollupOptions as RollupCfg} from 'rollup';

export type RollupPluginCfg = {|
  rollupCfg?: GetModuleHandler<Array<RollupCfg> | RollupCfg>,
|};

*/

module.exports = (cfg => {
  const { rollupCfg } = cfg || {};
  return {
    commands: {
      rollup: {
        describe: 'Package with rollup',
        handler: ({ env, args }) => env.run('rollup', args),
      },
    },
    modules: {
      'rollup.config.js': rollupCfg,
    },
    filepath: __filename,
  };
} /*: CreatePlugin<?RollupPluginCfg> */);
