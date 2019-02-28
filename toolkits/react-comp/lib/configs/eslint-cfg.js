// @flow
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:flowtype/recommended',
  ],
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [],
  root: true,
  rules: {
    curly: 'warn',
    'no-console': 'off',
    strict: ['error', 'global'],
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'flowtype/no-types-missing-file-annotation': 'off',
      },
    },
  ],
};
