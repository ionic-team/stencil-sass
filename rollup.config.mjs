import pkg from './package.json';
import pluginSass from './rollup.plugin.sass.js';
import rollupResolve from '@rollup/plugin-node-resolve';


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
