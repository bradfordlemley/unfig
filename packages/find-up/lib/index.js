// @flow strict
const fs = require("fs");
const path = require("path");

function findUp /*::<T>*/(
  predicate /* :string => ?T */,
  startDir /* :?string */,
  maxUp /* :?number */ = 100
) /* :?T */ {
  let lastDir = null;
  const first = path.resolve(startDir || "");
  let currDir = first;
  let n = 0;
  for (;;) {
    const result = predicate(currDir);
    if (result != null) {
      return result;
    }
    lastDir = currDir;
    currDir = path.dirname(lastDir);
    if (currDir === lastDir) {
      break;
    }
    n++;
    if (maxUp != null && n >= maxUp) {
      throw new Error(`Exceeded max dirs (${maxUp}) looking up from ${first}`);
    }
  }
  return;
}

function findFileUp(
  name /* :string */,
  startDir /* :?string */,
  maxUp /* :?number */
) /* :?string */ {
  const result = findUp(
    dir => {
      const currFile = path.join(dir, name);
      if (fs.existsSync(currFile)) {
        return currFile;
      }
    },
    startDir,
    maxUp
  );
  return result;
}

module.exports = findUp;
module.exports.findFileUp = findFileUp;
