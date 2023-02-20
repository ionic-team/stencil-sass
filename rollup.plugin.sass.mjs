import { fileURLToPath } from 'node:url'
import { minify } from 'terser';

/**
 * A rollup plugin for bundling Sass directly into the project
 */
export default function() {
  const sassFilePath = fileURLToPath(new URL('node_modules/sass/sass.dart.js', import.meta.url));
  return {
    /**
     * A rollup build hook for resolving the Sass implementation module.
     * @param {string} id the importee exactly as it is written in an import statement in the source code
     * @returns {string | undefined} the path to the Sass implementation from the root of this project
     */
    resolveId(id) {
      if (id === 'sass') {
        return sassFilePath;
      }
    },
    /**
     * Wraps Sass to bundle it into the project
     * @param {string} code the code to modify
     * @param {string} id module's identifier
     * @returns {string} the modified code
     */
    async transform(code, id) {
      if (id === sassFilePath) {
        return await wrapSassImport(code);
      }
      return code;
    },
    name: 'sassPlugin'
  }
};


/**
 * Wraps Sass in an IIFE to make it easier for rollup to find CJS exports and minifies it.
 *
 * This function generates code for calling Sass' entrypoint function (`load()`) and capturing a reference to its
 * `render` function.
 *
 * @param {string} code the Sass implementation code
 * @returns {Promise<string>} the wrapped Sass code
 */
async function wrapSassImport(code) {
  code = `

const Sass = {};

(function(exports) {
/** https://www.npmjs.com/package/sass **/

/**
 Copyright (c) 2016, Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

${code};

})(Sass);

Sass.load({});
const render = Sass.render;
export { render };
`;

  if (!code.includes('dartNodePreambleSelf.window')) {
    // in jest environments, global.window DOES exist
    // which messes with sass's file path resolving on node
    // remove global.window check to force it to know we're on node
    throw new Error('cannot find "dartNodePreambleSelf.window" in sass.dart');
  }
  code = code.replace(
    'dartNodePreambleSelf.window',
    'false /** NODE ENVIRONMENT **/'
  );

  code = removeCliPkgRequire(code, 'chokidar');
  code = removeCliPkgRequire(code, 'readline');
  code = removeNodeRequire(code, 'immutable');

  const minified = await minify(code, { module: true });
  code = minified.code;

  return code
}

/**
 * Node modules are required by node_modules/sass/sass.dart.js via `_cli_pkg_requires`.
 *
 * This function manually removes unneeded require statements from the source.
 *
 * @param {string} code the code to modify
 * @param {string} moduleId the module identifier found in a require-like statement
 * @returns {string} the modified code
 */
function removeCliPkgRequire(code, moduleId) {
  // e.g. `self.chokidar = _cli_pkg_requires.chokidar;`
  const requireStr = `self.${moduleId} = _cli_pkg_requires.${moduleId};`;
  if (!code.includes(requireStr)) {
    throw new Error(`cannot find "${requireStr}" in sass.dart`);
  }
  return code.replace(
    requireStr,
    '{}'
  );
}

/**
 * Node modules are required by node_modules/sass/sass.dart.js via `require`.
 *
 * This function manually removes unneeded require statements from the source.
 *
 * @param {string} code the code to modify
 * @param {string} moduleId the module identifier found in a require-like statement
 * @returns {string} the modified code
 */
function removeNodeRequire(code, moduleId) {
  const requireStr = `require("${moduleId}")`;
  if (!code.includes(requireStr)) {
    throw new Error(`cannot find "${requireStr}" in sass.dart`);
  }
  return code.replace(
      requireStr,
      '{}'
  );
}