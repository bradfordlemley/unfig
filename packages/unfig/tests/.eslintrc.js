/* tests don't need to be in node-only, use default lib lint config */
module.exports = require('../lib').getCfg(__filename);
