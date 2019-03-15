// @flow

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type ReactCompPluginCfg = {|

|}

*/

const IGNORE = ['tree-kill'];

module.exports = (cfg => ({
  toolDependencies: (pkg, deps) => {
    const newDeps = { ...deps };
    IGNORE.forEach(dep => delete newDeps[dep]);
    return newDeps;
  },
  toolkits: [
    require('@unfig/toolkit-stdprj')({
      ...cfg,
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
