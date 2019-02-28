// @flow strict
module.exports = {
  extends: ["eslint:recommended", "plugin:node/recommended"],
  env: {
    // es6: true,
    jest: true,
    node: true
  },
  root: true,
  rules: {
    // curly: 'warn',
    "no-console": "off"
    // strict: ['error', 'global'],
  }
};
