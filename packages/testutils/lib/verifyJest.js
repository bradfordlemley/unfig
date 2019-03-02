//@flow strict
const fs = require('fs-extra');
const path = require('path');
const normalize = require('./normalize');

function parseResults(file /* :string */, relDir /* :string */) {
  const results = fs.readJSONSync(file);

  const summary = results.testResults.reduce((a, test) => {
    const results = test.assertionResults.reduce((r, assertion) => {
      if (!r[assertion.status]) {
        r[assertion.status] = 1;
      } else {
        r[assertion.status]++;
      }
      return r;
    }, {});
    const name = normalize(
      relDir ? path.relative(relDir, test.name) : test.name
    );
    a[name] = { results };
    return a;
  }, {});
  return summary;
}

function verifyResults(actualFile /* :string */, expectedFile /* :string */) {
  const actual = parseResults(actualFile, path.dirname(expectedFile));
  const expected = fs.readJSONSync(expectedFile);
  expect(actual).toEqual(expected.tests);
}

module.exports = {
  parseResults,
  verifyResults,
};
