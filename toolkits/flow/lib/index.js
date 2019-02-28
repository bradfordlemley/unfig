//@flow strict

/*::

import type {CreatePlugin} from '@unfig/type-toolkit';

export type FlowPluginCfg = {|

|}

*/

module.exports = (() => ({
  commands: {
    flow: {
      describe: "Flow your code",
      handler: ({ env, args }) => env.run("flow", args)
    },
    "flow-typed": {
      describe: "Install flow types",
      handler: async ({ env, args }) => {
        const result = await env.run("flow", ["version"], { stdio: undefined });
        // await result;
        const stdout = result.stdout || "";
        console.log(`result: ${stdout}`);
        const match = /version (\S+)/.exec(stdout);
        if (!match) {
          throw new Error(`Could not get flow version from: ${stdout}`);
        }
        return env.run("flow-typed", ["--flowVersion", match[1]].concat(args));
      }
    },
    reflow: {
      describe: "Flow your code",
      handler: async ({ env, args }) => {
        await env.run("unfig", ["flow", "stop"]);
        return env.run("unfig", ["flow"].concat(args));
      }
    }
  },
  filepath: __filename
}) /*:CreatePlugin<?FlowPluginCfg> */);
