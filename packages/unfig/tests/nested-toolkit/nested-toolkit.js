// @flow strict

/*::
import type {CreatePlugin} from '@unfig/type-toolkit';
*/

module.exports = (() => ({
  modules: {
    'config1.js': () => 'nested-config1',
    'config5.js': () => 'nested-config5',
  },
  commands: {
    cmd1: {
      handler: async () => 'nested-cmd1-ouput',
    },
    cmd3: {
      handler: async () => 'nested-cmd3-output',
    },
  },
  load: () => ({
    modules: {
      'config2.js': () => 'nested-config2',
    },
    commands: {
      cmd2: {
        handler: async () => 'nested-cmd2-ouput',
      },
      cmd7: {
        handler: async () => 'nested-cmd7-output',
      },
    },
  }),
  toolDependencies: {
    babel: "6.23.0",
    rimraf: "2.6.3",
  },
  filepath: __filename,
}) /*:CreatePlugin<{}> */);
