// @flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

import type {StdPrjPluginCfg} from '@unfig/toolkit-stdprj';

export type NodeScriptPluginCfg = {|
  ...StdPrjPluginCfg,
  bare?: boolean,
|};

*/

module.exports = (cfg => {
  const { bare, ...rest } = cfg || {};

  return {
    toolkits: [
      require("@unfig/toolkit-stdprj")({
        eslintCfg: () => require("./eslint-cfg"),
        babelCfg: bare ? undefined : () => require("./babel-cfg"),
        // $ExpectError: inexact spread
        ...rest
      })
    ],
    filepath: __filename
  };
} /*:CreatePlugin<?NodeScriptPluginCfg> */);
