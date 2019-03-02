// @flow strict
const findBackslash = /\\/g;
module.exports = (f /* :string */) => f.replace(findBackslash, '/');
