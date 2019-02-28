// @flow strict

module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: { node: true }
      }
    ],
    "@babel/preset-flow",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread"
  ],
  sourceMaps: "both"
};
