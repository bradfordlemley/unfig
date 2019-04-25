// @flow
const process = require('process');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const sourceMaps = require('rollup-plugin-sourcemaps');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const { sizeSnapshot } = require('rollup-plugin-size-snapshot');

/*::

import type {PkgJson} from '@unfig/type-pkg-json';
import type {RollupCfgPluginCfg} from '.';

import type {RollupOptions as RollupCfg} from 'rollup';

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
}) /*: RollupCfg */ => {
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
      resolve({ extensions }),
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

const buildCjs = ({ env, input, file, extensions }) /*: RollupCfg */ => {
  return {
    input,
    external,
    output: {
      file,
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve({ extensions }),
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

function forceRel(path) {
  return path.startsWith('.') ? path : `./${path}`;
}

module.exports = (cfg /*: RollupCfgInput */) /* :Array<RollupCfg> */ => {
  const { pkgJson, input: origInput, umdGlobals, extensions: exts, files } =
    cfg || {};
  if (!pkgJson) {
    throw new Error(`PkgJson is required for rollup config`);
  }
  const input = forceRel(origInput);
  const extensions =
    exts && exts.map(ext => (ext.startsWith('.') ? ext : `.${ext}`));
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
        resolve({ extensions }),
        babel({
          exclude: '**/node_modules/**',
          extensions: cfg.extensions,
        }),
        process.platform !== 'win32' && sizeSnapshot(),
        sourceMaps(),
      ],
    },
  ].map(rc =>
    Object.assign({}, rc, {
      watch: {
        clearScreen: false,
      },
    })
  );
};
