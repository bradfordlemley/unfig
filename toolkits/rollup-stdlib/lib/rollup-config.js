// @flow strict

// $ExpectError: untyped import
const commonjs = require('rollup-plugin-commonjs');
// $ExpectError: untyped import
const replace = require('rollup-plugin-replace');
// $ExpectError: untyped import
const resolve = require('rollup-plugin-node-resolve');
// $ExpectError: untyped import
const sourceMaps = require('rollup-plugin-sourcemaps');
// $ExpectError: untyped import
const babel = require('rollup-plugin-babel');
// $ExpectError: untyped import
const { terser } = require('rollup-plugin-terser');
// $ExpectError: untyped import
const { sizeSnapshot } = require('rollup-plugin-size-snapshot');

/*::

import type {PkgJson} from '@unfig/type-pkg-json';
import type {RollupCfgPluginCfg} from '.';

type RollupCfgInput = {|
  extensions?: $ReadOnlyArray<string>, 
  input: string,
  pkgJson?: ?PkgJson,
  umdGlobals?: { [string]:string },
  files: {
    cjs: string,
    cjs_dev: string,
    cjs_prod: string,
    esm: string,
    umd_dev: string,
    umd_prod: string,
  },
|}

*/

const external = (id /*: string*/) =>
  !id.startsWith('.') && !id.startsWith('/');

const buildUmd = ({
  env,
  file,
  input,
  umdGlobals: globals,
  pkgJson,
  extensions,
}) => {
  return {
    input,
    external: globals && Object.keys(globals),
    output: {
      name: pkgJson.name,
      format: 'umd',
      sourcemap: true,
      file,
      exports: 'named',
      globals,
    },
    plugins: [
      resolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      babel({
        exclude: '**/node_modules/**',
        extensions,
      }),
      commonjs({
        include: /node_modules/,
        namedExports: {
          'node_modules/prop-types/index.js': [
            'object',
            'oneOfType',
            'string',
            'node',
            'func',
            'bool',
            'element',
          ],
        },
      }),
      sourceMaps(),
      sizeSnapshot(),
      env === 'production' &&
        terser({
          sourcemap: true,
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
          },
          warnings: true,
          ecma: 5,
          toplevel: false,
        }),
    ],
  };
};

const buildCjs = ({ env, input, file, extensions }) => {
  return {
    input,
    external,
    output: {
      file,
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      babel({
        exclude: '**/node_modules/**',
        extensions,
      }),
      sourceMaps(),
      sizeSnapshot(),
      env === 'production' &&
        terser({
          sourcemap: true,
          output: { comments: false },
          compress: {
            keep_infinity: true,
            pure_getters: true,
          },
          warnings: true,
          ecma: 5,
          // Compress and/or mangle variables in top level scope.
          // @see https://github.com/terser-js/terser
          toplevel: true,
        }),
    ],
  };
};

module.exports = (cfg /*: RollupCfgInput */) => {
  const { pkgJson, input, umdGlobals, extensions, files } = cfg || {};
  if (!pkgJson) {
    throw new Error(`PkgJson is required for rollup config`);
  }
  return [
    buildUmd({
      env: 'production',
      input,
      file: files.umd_prod,
      pkgJson,
      umdGlobals,
      extensions,
    }),
    buildUmd({
      env: 'development',
      input,
      file: files.umd_dev,
      pkgJson,
      umdGlobals,
      extensions,
    }),
    buildCjs({
      env: 'production',
      input,
      file: files.cjs_prod,
      pkgJson,
      extensions,
    }),
    buildCjs({
      env: 'development',
      input,
      file: files.cjs_dev,
      pkgJson,
      extensions,
    }),
    {
      input,
      external,
      output: [
        {
          file: files.esm,
          format: 'esm',
          sourcemap: true,
        },
      ],
      plugins: [
        resolve(),
        babel({
          exclude: '**/node_modules/**',
          extensions: cfg.extensions,
        }),
        sizeSnapshot(),
        sourceMaps(),
      ],
    },
  ];
};
