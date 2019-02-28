// @flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

import type {NodeScriptPluginCfg} from '@unfig/toolkit-node-script';

export type BareNodePluginCfg = {|
  ...NodeScriptPluginCfg
|}

*/

module.exports = (cfg => ({
  toolkits: [
    require("@unfig/toolkit-node-script")({ bare: true, srcDir: "lib", ...cfg })
  ],
  filepath: __filename
}) /*:CreatePlugin<?BareNodePluginCfg> */);
