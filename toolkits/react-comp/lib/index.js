// @flow

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type ReactCompPluginCfg = {|

|}

*/

module.exports = (() => ({
  toolDependencies: true,
  toolkits: [
    require('@unfig/toolkit-stdprj')({
      babelCfg: () => require('./configs/babel-config'),
      eslintCfg: () => require('./configs/eslint-cfg'),
      umdGlobals: {
        react: 'React',
        'react-native': 'ReactNative',
      },
    }),
  ],
  filepath: __filename,
}) /*:CreatePlugin<ReactCompPluginCfg> */);
