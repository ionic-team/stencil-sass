import { createRequire } from 'node:module';
import pluginSass from './rollup.plugin.sass.mjs';
import rollupResolve from '@rollup/plugin-node-resolve';

// require `package.json` in order to use its 'main' and 'module' fields to tell rollup where to output the generated
// bundles
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

/**
 * Generate an ESM and a CJS output bundle
 */
export default {
  // the input is expected to exist at this location as a result of running the typescript compiler
  input: 'dist/index.js',

  plugins: [
    pluginSass(),
    rollupResolve({
      preferBuiltins: true
    }),
  ],

  external: [
    'fs',
    'path'
  ],

  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'esm',
      file: pkg.module
    }
  ]
};
