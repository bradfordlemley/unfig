//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type HuskyPluginCfg = {|
  huskyCfg: () => {}
|}

*/

module.exports = (cfg => {
  const { huskyCfg } = cfg || {};
  return {
    modules: {
      ".huskyrc.js": huskyCfg ? () => huskyCfg() : require("./husky-cfg")()
    },
    filepath: __filename
  };
} /*:CreatePlugin<?HuskyPluginCfg> */);
