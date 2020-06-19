import * as path from 'path';
import { minify } from 'terser';

export default function() {
  const sassFilePath = path.join(__dirname, 'node_modules', 'sass', 'sass.dart.js');
  return {
    resolveId(id) {
      if (id === 'sass') {
        return sassFilePath;
      }
    },
    transform(code, id) {
      // a little nudge to make it easier for
      // rollup to find the cjs exports
      if (id === sassFilePath) {
        return wrapSassImport(code);
      }
      return code;
    },
    name: 'sassPlugin'
  }
};


function wrapSassImport(code) {
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

  code = removeNodeRequire(code, 'chokidar');
  code = removeNodeRequire(code, 'readline');

  code = minify(code, { module: true }).code;

  return code
}

function removeNodeRequire(code, moduleId) {
  const requireStr = `require("${moduleId}")`;
  if (!code.includes(requireStr)) {
    // node modules are required by sass.dart
    // however this build doesn't use or need them
    // so we'll manually remove it from the source
    throw new Error(`cannot find "${requireStr}" in sass.dart`);
  }
  return code.replace(
    requireStr,
    '{}'
  );
}