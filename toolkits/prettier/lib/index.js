// @flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type PrettierPluginCfg = {
  prettierCfg?: () => {}
}

*/

module.exports = (cfg => {
  const { prettierCfg } = cfg || {};

  return {
    commands: {
      prettier: {
        describe: 'Prettyify your files',
        handler: ({ env, args }) => {
          return env.run('prettier', args);
        },
      },
    },
    modules: {
      '.prettierrc.js': prettierCfg && (() => prettierCfg()),
    },
    filepath: __filename,
  };
} /*:CreatePlugin<?PrettierPluginCfg> */);
