import * as d from './declarations';
import * as path from 'path';


export function usePlugin(fileName: string) {
  return /(\.scss|\.sass)$/i.test(fileName);
}


export function getRenderOptions(opts: d.PluginOptions, sourceText: string, fileName: string, context: d.PluginCtx) {
  // create a copy of the original sass config so we don't change it
  const renderOpts = Object.assign({}, opts);

  // always set "data" from the source text
  renderOpts.data = sourceText;

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
        injectGlobalPath = path.join(context.config.rootDir, injectGlobalPath);
      }

      return `@import "${injectGlobalPath}";`;
    }).join('');

    renderOpts.data = injectText + renderOpts.data;
  }

  // remove non-standard node-sass option
  delete renderOpts.injectGlobalPaths;

  // the "file" config option is not valid here
  delete renderOpts.file;

  return renderOpts;
}


export function createResultsId(fileName: string) {
  // create what the new path is post transform (.css)
  const pathParts = fileName.split('.');
  pathParts[pathParts.length - 1] = 'css';
  return pathParts.join('.');
}
