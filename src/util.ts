import * as d from './declarations';
import * as path from 'path';
import { Importer } from 'sass';


export function usePlugin(fileName: string) {
  if (typeof fileName === 'string') {
    return /(\.scss|\.sass)$/i.test(fileName);
  }
  return true;
}

export function getRenderOptions(opts: d.PluginOptions, sourceText: string, fileName: string, context: d.PluginCtx) {
  // create a copy of the original sass config so we don't change it
  const renderOpts = Object.assign({}, opts);

  // always set "data" from the source text
  renderOpts.data = sourceText;

  // activate indented syntax if the file extension is .sass
  renderOpts.indentedSyntax = /(\.sass)$/i.test(fileName);

  renderOpts.includePaths = Array.isArray(opts.includePaths) ? opts.includePaths.slice() : [];

  // add the directory of the source file to includePaths
  renderOpts.includePaths.push(path.dirname(fileName));

  renderOpts.includePaths = renderOpts.includePaths.map(includePath => {
    if (path.isAbsolute(includePath)) {
      return includePath;
    }
    // if it's a relative path then resolve it with the project's root directory
    return path.resolve(context.config.rootDir, includePath);
  });

  const injectGlobalPaths = Array.isArray(opts.injectGlobalPaths) ? opts.injectGlobalPaths.slice() : [];

  if (injectGlobalPaths.length > 0) {
    // automatically inject each of these paths into the source text
    const injectText = injectGlobalPaths.map(injectGlobalPath => {
      if (!path.isAbsolute(injectGlobalPath)) {
        // convert any relative paths to absolute paths relative to the project root

        if (context.sys && typeof context.sys.normalizePath === 'function') {
          // context.sys.normalizePath added in stencil 1.11.0
          injectGlobalPath = context.sys.normalizePath(path.join(context.config.rootDir, injectGlobalPath));
        } else {
          // TODO, eventually remove normalizePath() from @stencil/sass
          injectGlobalPath = normalizePath(path.join(context.config.rootDir, injectGlobalPath));
        }
      }

      const importTerminator = renderOpts.indentedSyntax ? '\n' : ';';

      return `@import "${injectGlobalPath}"${importTerminator}`;
    }).join('');

    renderOpts.data = injectText + renderOpts.data;
  }

  // remove non-standard sass option
  delete renderOpts.injectGlobalPaths;

  // the "file" config option is not valid here
  delete renderOpts.file;

  if (context.sys && typeof context.sys.resolveModuleId === 'function') {
    const importers: Importer[] = []
    if (typeof renderOpts.importer === 'function') {
      importers.push(renderOpts.importer);
    } else if (Array.isArray(renderOpts.importer)) {
      importers.push(...renderOpts.importer);
    }

    const importer: Importer = (url, _prev, done) => {
      if (typeof url === 'string') {
        if (url.startsWith('~')) {
          try {
            const m = getModuleId(url);

            if (m.moduleId) {
              context.sys.resolveModuleId({
                moduleId: m.moduleId,
                containingFile: m.filePath
              }).then((resolved) => {
                if (resolved.pkgDirPath) {
                  const resolvedPath = path.join(resolved.pkgDirPath, m.filePath);
                  done({
                    file: context.sys.normalizePath(resolvedPath)
                  });
                } else {
                  done(null);
                }

              }).catch(err => {
                done(err);
              });

              return;
            }
          } catch (e) {
            done(e);
          }
        }
      }
      done(null);
    };
    importers.push(importer);

    renderOpts.importer = importers;
  }

  return renderOpts;
}


export function createResultsId(fileName: string) {
  // create what the new path is post transform (.css)
  const pathParts = fileName.split('.');
  pathParts[pathParts.length - 1] = 'css';
  return pathParts.join('.');
}

export function normalizePath(str: string) {
  // Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
  // https://github.com/sindresorhus/slash MIT
  // By Sindre Sorhus
  if (typeof str !== 'string') {
    throw new Error(`invalid path to normalize`);
  }
  str = str.trim();

  if (EXTENDED_PATH_REGEX.test(str) || NON_ASCII_REGEX.test(str)) {
    return str;
  }

  str = str.replace(SLASH_REGEX, '/');

  // always remove the trailing /
  // this makes our file cache look ups consistent
  if (str.charAt(str.length - 1) === '/') {
    const colonIndex = str.indexOf(':');
    if (colonIndex > -1) {
      if (colonIndex < str.length - 2) {
        str = str.substring(0, str.length - 1);
      }

    } else if (str.length > 1) {
      str = str.substring(0, str.length - 1);
    }
  }

  return str;
}

export function getModuleId(orgImport: string) {
  if (orgImport.startsWith('~')) {
    orgImport = orgImport.substring(1);
  }
  const splt = orgImport.split('/');
  const m = {
    moduleId: null as string,
    filePath: null as string,
  };

  if (orgImport.startsWith('@') && splt.length > 1) {
    m.moduleId = splt.slice(0, 2).join('/');
    m.filePath = splt.slice(2).join('/');
  } else {
    m.moduleId = splt[0];
    m.filePath = splt.slice(1).join('/');
  }

  return m;
};

const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
const SLASH_REGEX = /\\/g;
