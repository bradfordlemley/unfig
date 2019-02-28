//@flow strict
const fs = require('fs-extra');
const path = require('path');

function verifyDir(dir /* :string */, files /* :Array<string> */) {
  const actual = fs.readdirSync(dir);
  expect(actual).toEqual(files);
}

function verifyFilelist(filelist /* :string */) {
  const base = path.dirname(filelist);
  const entries = fs.readJSONSync(filelist);
  Object.keys(entries).forEach(dir =>
    verifyDir(path.join(base, dir), entries[dir])
  );
}

module.exports = {
  verifyDir,
  verifyFilelist,
};
