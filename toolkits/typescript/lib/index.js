//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type TypescriptPluginCfg = {|

|}

*/

module.exports = (() => ({
  commands: {
    tsc: {
      describe: "tsc build",
      handler: ({ env, args }) => env.run("tsc", args)
    }
  },
  filepath: __filename
}) /*:CreatePlugin<?TypescriptPluginCfg> */);
