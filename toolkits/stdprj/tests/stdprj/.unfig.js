// @flow

module.exports = {
  toolkits: [
    require('../../lib')({
      eslintCfg: () => 'eslint-config',
      babelCfg: () => 'babel-config',
    }),
  ],
};
