// @flow
const fs = require('fs');
// $ExpectError: untyped module
const maxstache = require('maxstache');
const path = require('path');

const templateDir = path.join(__dirname, '../template');

function genFromFile(template /* :string */, vars /*: {} */) {
  const content = fs.readFileSync(template, { encoding: 'utf-8' });
  return maxstache(content, vars);
}

module.exports = {
  genFromFile,
  templateDir,
};
