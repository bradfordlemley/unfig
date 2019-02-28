# Todos

- [ ] Figure out how to distribute flow defs
- [ ] Generate typescript type declarations

# Config

unfig supports some (optional) minimal configuration options via .unfig.config.js file:

```
// .prx-config.config.js
module.exports = {
  type: 'lib' (default) | 'script, // main config option
  coverageDirectory: 'coverage',  // where to store test --coverage
  coveragePathIgnorePatterns: [], // ignore coverage, e.g. ['docs']
  distDirs: ['dist'], // build output dir, one for each src
  srcDirs: type === 'lib' ? ['src'] : ['.'],  // src
  testDirs: ['test'],  // xtra dirs for finding tests, can also be in srcDirs
  testFilePatterns: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [], // ignore tests found that match this, e.g. ['tools']
}
```

# Build Outputs

Build outputs are transpiled down to be compatible with the latest node version.

For web and browser apps, your app build should transpile this (and other dependencies) down to be compatible with your final target environment.

Polyfills are not included; again, your app build needs to include polyfills necessary for your final target environment.

Note: If you use react-scripts 2.0+ to build your app, it does this for you.

What about async/await? hmmm? Yeah, I guess the consumer should transpile and polyfill.
