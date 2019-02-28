//@flow strict
const fs = require('fs-extra');
const path = require('path');

function parseResults(file /* :string */, relDir /* :string */) {
  const results = fs.readJSONSync(file);
  const summary = {};
  results.forEach(result => {
    const { filePath, errorCount, warningCount } = result;
    const name = relDir ? path.relative(relDir, filePath) : filePath;
    summary[name] = { errorCount, warningCount };
  });
  return summary;
}

function verifyResults(actualFile /* :string */, expectedFile /* :string */) {
  const actual = parseResults(actualFile, path.dirname(expectedFile));
  const expected = fs.readJSONSync(expectedFile);
  expect(actual).toEqual(expected);
}

module.exports = {
  parseResults,
  verifyResults,
};
