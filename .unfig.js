// @flow
const path = require('path');

module.exports = {
  toolkits: [require('./toolkits/monorepo/lib')({
    ignoreMissingPkgCmd: ({pkgFile}) => path.basename(path.dirname(pkgFile)).startsWith('type'),
  })]
};
