import pkg from './package.json';
import pluginSass from './rollup.plugin.sass';
import rollupResolve from 'rollup-plugin-node-resolve';


export default {
  input: 'dist/index.js',

  plugins: [
    pluginSass(),
    rollupResolve({
      preferBuiltins: true
    }),
    {
      generateBundle(_options, bundle) {
        // chokidar is required by sass.dart
        // however this build doesn't use or need chokidar
        // so we're manually hacking the source to remove it
        Object.keys(bundle).forEach(fileName => {
          bundle[fileName].code = bundle[fileName].code.replace(
            'require("chokidar")',
            '{}'
          );
        });
      }
    },
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
