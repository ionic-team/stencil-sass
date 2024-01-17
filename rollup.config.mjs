import fs from 'node:fs/promises'
import pluginSass from './rollup.plugin.sass.mjs';
import typescript from '@rollup/plugin-typescript';
import rollupResolve from '@rollup/plugin-node-resolve';

// require `package.json` in order to use its 'main' and 'module' fields to tell rollup where to output the generated
// bundles
const pkg = JSON.parse((await fs.readFile('./package.json')));

/**
 * Generate an ESM and a CJS output bundle
 */
export default {
  // the input is expected to exist at this location as a result of running the typescript compiler
  input: 'src/index.ts',

  plugins: [
    typescript(),
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
