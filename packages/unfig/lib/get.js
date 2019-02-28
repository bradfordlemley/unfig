//@flow

const path = require('path');
const { getUnfig } = require('./toolkit');

function getCfgFile(requestFile /* :string */) {
  const { unfig } = getUnfig(path.dirname(requestFile));
  if (!unfig) {
    throw new Error(`Unfig config was not found for ${requestFile}`);
  }
  return unfig.getModule(requestFile);
}

module.exports = getCfgFile;
