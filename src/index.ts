// https://github.com/sass/dart-sass/issues/459
// @ts-ignore
import * as Sass from 'sass';
import * as d from './declarations';
import { loadDiagnostic } from './diagnostics';
import * as util from './util';


export function sass(opts: d.PluginOptions = {}) {

  return {
    name: 'sass',

    transform(sourceText: string, fileName: string, context: d.PluginCtx) {
      if (!context || !util.usePlugin(fileName)) {
        return null;
      }

      const renderOpts = util.getRenderOptions(opts, sourceText, fileName, context);

      const results: d.PluginTransformResults = {
        id: util.createResultsId(fileName)
      };

      if (sourceText.trim() === '') {
        results.code = '';
        return Promise.resolve(results);
      }

      return new Promise<d.PluginTransformResults>(resolve => {

        Sass.render(renderOpts, (err: any, sassResult: any) => {
          if (err) {
            loadDiagnostic(context, err, fileName);
            results.code = `/**  sass error${err && err.message ? ': ' + err.message : ''}  **/`;
            resolve(results);

          } else {
            results.code = sassResult.css.toString();

            // write this css content to memory only so it can be referenced
            // later by other plugins (autoprefixer)
            // but no need to actually write to disk
            context.fs.writeFile(results.id, results.code, { inMemoryOnly: true }).then(() => {
              resolve(results);
            });
          }
        });
      });
    }
  };
}
