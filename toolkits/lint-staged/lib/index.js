// @flow strict

/*::

import type {CreatePlugin, GetModuleHandler} from '@unfig/type-toolkit';

export type LintStagedPluginCfg = {
  lintStagedCfg?: GetModuleHandler<{}>,
}

*/

module.exports = (cfg => {
  const { lintStagedCfg } = cfg || {};
  return {
    commands: {
      'lint-staged': {
        describe: 'Check your staged files',
        handler: ({ env, args }) => {
          return env.run('lint-staged', args);
        },
      },
    },
    modules: {
      'lint-staged.config.js': lintStagedCfg,
    },
    filepath: __filename,
  };
} /*:CreatePlugin<?LintStagedPluginCfg> */);
