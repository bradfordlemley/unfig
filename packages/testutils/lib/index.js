// @flow strict
const { initWorkspace, withInitWorkspace } = require('./workspace');
const { verifyFilelist, verifyDir } = require('./verifyFiles');
const { verifyResults: verifyJestResults } = require('./verifyJest');
const { verifyResults: verifyEslintResults } = require('./verifyEslint');
const { verifyResults: verifyCoverage } = require('./verifyCoverage');

module.exports = {
  initWorkspace,
  verifyCoverage,
  verifyDir,
  verifyEslintResults,
  verifyFilelist,
  verifyJestResults,
  withInitWorkspace,
};
