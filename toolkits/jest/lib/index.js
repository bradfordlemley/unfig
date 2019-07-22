//@flow strict

/*::

import type {CreatePlugin, GetModuleHandler} from '@unfig/type-toolkit';

export type JestConfigType = {|
  coverageDirectory?: string,
  collectCoverageFrom?: $ReadOnlyArray<string>,
  coveragePathIgnorePatterns?: $ReadOnlyArray<string>,
  rootDir?: string,
  roots?: $ReadOnlyArray<string>,
  testMatch?: $ReadOnlyArray<string>,
  moduleFileExtensions?: $ReadOnlyArray<string>,
  projects?: $ReadOnlyArray<string>,
  setupFilesAfterEnv?: $ReadOnlyArray<string>,
  transform?: {},
  testPathIgnorePatterns?: $ReadOnlyArray<string>,
|};

export type JestPluginCfg = {|
  jestCfg?: GetModuleHandler<JestConfigType>,
|}

*/

module.exports = (cfg => {
  const { jestCfg } = cfg || {};
  return {
    commands: {
      jest: {
        describe: 'Test with jest',
        handler: ({ env, args }) => env.run('jest', args),
      },
      'jest:debug': {
        describe: 'Debug while running jest tests',
        handler: ({ env, args }) =>
          env.run(
            'jest',
            ['--runInBand', '--no-cache', '--watch'].concat(args),
            { nodeArgs: ['--inspect'] }
          ),
      },
      'jest:debugbrk': {
        describe: 'Debug while running jest tests',
        handler: ({ env, args }) =>
          env.run(
            'jest',
            ['--runInBand', '--no-cache', '--watch'].concat(args),
            { nodeArgs: ['--inspect-brk'] }
          ),
      },
    },
    modules: {
      'jest.config.js': jestCfg,
    },
    filepath: __filename,
  };
} /*:CreatePlugin<?JestPluginCfg> */);
