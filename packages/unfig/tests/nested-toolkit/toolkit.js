// @flow

/*::
import type {CreatePlugin} from '@unfig/type-toolkit';
*/

module.exports = (() => ({
  dependencies: {
    eslint: "5.10.0",
    babel: "6.0.0",
  },
  toolkits: [require('./nested-toolkit.js')],
  modules: {
    'config1.js': () => 'top-config1',
    'config5.js': ({ self, requestFile }) => {
      const result = self.children.getModule(requestFile);
      return `top-config5--${
        typeof result === 'string' ? result : 'result-not-string'
      }`;
    },
  },
  commands: {
    cmd1: {
      handler: async () => 'top-cmd1-output',
    },
    cmd3: {
      handler: async ({ self }) => self.children.execCmd('cmd3'),
    },
    cmd4: {
      handler: async ({ self }) => self.children.execCmd('cmd3'),
    },
    cmd5: {
      handler: async ({ self }) => self.toolkits[0].commands.cmd3.exec(),
    },
  },
  load: () => ({
    modules: {
      'config3.js': () => ({ config3: 'config3' }),
    },
    commands: {
      command3: {
        describe: 'test',
        handler: async () => ({ code: 0 }),
      },
    },
  }),
  filepath: __filename,
}) /*:CreatePlugin<{}> */);
