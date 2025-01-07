import fs from 'node:fs/promises'
import typescript from '@rollup/plugin-typescript';
import rollupResolve from '@rollup/plugin-node-resolve';

const pkg = JSON.parse((await fs.readFile('./package.json')));

/**
 * Generate an ESM and a CJS output bundle
 */
export default {
  // the input is expected to exist at this location as a result of running the typescript compiler
  input: 'src/index.ts',

  plugins: [
    typescript(),
    rollupResolve({
      preferBuiltins: true
    }),
  ],

  external: [
    "sass-embedded",
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
