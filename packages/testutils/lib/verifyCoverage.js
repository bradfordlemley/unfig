//@flow strict
const fs = require('fs-extra');
const path = require('path');

function parseResults(file /* :string */, relDir /* :string */) {
  const results /* :{[string]: {+s: string}} */ = fs.readJSONSync(file);
  const summary = {};
  // Object.entries(results).forEach(([filePath, result]) => {
  Object.keys(results).forEach(filepath => {
    const { s } = results[filepath];
    const name = relDir ? path.relative(relDir, filepath) : filepath;
    summary[name] = { s };
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
