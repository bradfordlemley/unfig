//@flow

const path = require('path');
const { loadToolkit } = require('./toolkit');

function getCfgFile(requestFile /* :string */) {
  const unfig = loadToolkit(path.dirname(requestFile));
  if (!unfig) {
    throw new Error(`Unfig config was not found for ${requestFile}`);
  }
  return unfig.getModule(requestFile);
}

module.exports = getCfgFile;
