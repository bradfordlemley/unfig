const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const unfig = require('unfig');

test('gets cfg files from toolkit', () => {
  expect(unfig.getCfg(path.join(__dirname, 'jest.config.js'))).toMatchObject({
    coverageDirectory: 'coverage',
  });
  expect(unfig.getCfg(path.join(__dirname, '.eslintrc.js'))).toEqual(
    'eslint-config'
  );
  expect(unfig.getCfg(path.join(__dirname, '.babelrc.js'))).toEqual(
    'babel-config'
  );
});
