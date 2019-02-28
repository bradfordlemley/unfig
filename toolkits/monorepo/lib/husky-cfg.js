// @flow strict

module.exports = {
  hooks: {
    'pre-commit':
      // 'lint-staged && lerna exec --concurrency 1 --no-bail -- lint-staged'
      'unfig pre-commit',
  },
};
