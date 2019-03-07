module.exports = () => ({
  modules: {
    '.config1.js': () => 'config1',
    'config2.js': () => 'config2',
    'config4.js': undefined,
    'config5.js': false,
  },
  commands: {
    test: {
      handler: async () => 'this is a test',
    },
    build: {
      handler: async () => 'this is a build',
    },
    cmdA: {
      handler: async ({ env }) => env.run('unfig', ['cmdB'], { stdio: 'pipe' }),
    },
    cmdB: {
      handler: async () => {
        console.log('CmdB-message');
      },
    },
    cmdC: {
      handler: async ({ env }) => env.run('unfig', ['cmdD'], { stdio: 'pipe' }),
    },
    cmdD: {
      handler: async () => {
        throw new Error(`cmdD-throw-message`);
      },
    },
  },
  load: () => ({
    modules: {
      'config3.js': () => 'config3',
    },
    commands: {
      command3: {
        handler: () => 'command3',
      },
    },
  }),
  toolDependencies: {
    eslint: "5.10.0"
  },
  filepath: __filename,
});
