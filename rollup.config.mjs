import { createRequire } from 'node:module';
import pluginSass from './rollup.plugin.sass.js';
import rollupResolve from '@rollup/plugin-node-resolve';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
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
