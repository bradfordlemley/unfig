// @flow strict
/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type PrettierPkgJsonPluginCfg = {
  prettierCfg?: () => {},
}

*/

module.exports = (() => ({
  commands: {
    'prettier-pkg-json': {
      describe: 'Prettyify your package.json',
      handler: ({ env, args }) => {
        return env.run('prettier-pkg-json', args);
      },
    },
  },
  filepath: __filename,
}) /*:CreatePlugin<?PrettierPkgJsonPluginCfg> */);
