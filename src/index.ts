import { render } from 'sass';
import * as d from './declarations';
import { loadDiagnostic } from './diagnostics';
import * as util from './util';


export function sass(opts: d.PluginOptions = {}) {

  return {
    name: 'sass',

    transform(sourceText: string, fileName: string, context?: d.PluginCtx) {
      if (!util.usePlugin(fileName)) {
        return null;
      }
      if (typeof sourceText !== 'string') {
        return null;
      }

      context = util.getContext(context);

      const renderOpts = util.getRenderOptions(opts, sourceText, fileName, context);

      const results: d.PluginTransformResults = {
        id: util.createResultsId(fileName),
        originalId: fileName
      };

      if (sourceText.trim() === '') {
        results.code = '';
        return Promise.resolve(results);
      }

      return new Promise<d.PluginTransformResults>(resolve => {
        try {
          render(renderOpts, (err, sassResult) => {
            if (err) {
              const diagnostic = loadDiagnostic(context, err, fileName);
              results.code = `/**  sass error${err && err.message ? ': ' + err.message : ''}  **/`;
              results.diagnostics = [diagnostic];
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

        } catch (e) {
          // who knows, just good to play it safe here
          const diagnostic: d.Diagnostic = {
            level: 'error',
            type: 'css',
            language: 'scss',
            header: 'sass error',
            relFilePath: null,
            absFilePath: null,
            messageText: e,
            lines: []
          };
          context.diagnostics.push(diagnostic);

          results.code = `/**  sass error${e && e.message ? ': ' + e.message : ''}  **/`;
          results.diagnostics = [diagnostic];
          resolve(results);
        }
      });
    }
  };
}
