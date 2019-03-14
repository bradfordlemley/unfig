// @flow strict

/*::

import type {StdPrjCfg} from '@unfig/stdprj-config';

type LintStagedCfg = {|
  linters: {[string]: string | Array<string>},
  ignore?: Array<string>,
  concurrent?: boolean,
|};

*/

module.exports = (stdCfg /*: $ReadOnly<StdPrjCfg> */) /*: LintStagedCfg */ => {
  const { ignoreDirs } = stdCfg;
  const prettierMatches = `**/*.{${stdCfg.jsSrcExts
    .concat(['json', 'css', 'md'])
    .join(',')}}`;
  const jsMatches = `${stdCfg.srcDir}/**/*.{js,jsx}`;
  return {
    linters: {
      [prettierMatches]: ['unfig prettier --write', 'git add'],
      [jsMatches]: ['unfig lint'],
      [jsMatches]: 'jest --bail --findRelatedTests',
      'package.json': ['prettier-package-json --write', 'git add'],
    },
    ignore: ignoreDirs && ignoreDirs.map(d => `${d}/**`),
    // with concurrency on, files can be updated (ie. prettier) after
    // jest, so jest output for line numbers might be misleading/wrong
    concurrent: false,
  };
};
