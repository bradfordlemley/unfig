// @flow strict
const { createWorkspace, withInitWorkspace } = require('./workspace');
const { verifyFilelist, verifyDir } = require('./verifyFiles');
const { verifyResults: verifyJestResults } = require('./verifyJest');
const { verifyResults: verifyEslintResults } = require('./verifyEslint');
const { verifyResults: verifyCoverage } = require('./verifyCoverage');

module.exports = {
  createWorkspace,
  verifyCoverage,
  verifyDir,
  verifyEslintResults,
  verifyFilelist,
  verifyJestResults,
  withInitWorkspace,
};
