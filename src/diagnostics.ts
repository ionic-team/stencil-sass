import { LegacyException as SassException } from 'sass';
import * as d from './declarations';

export function loadDiagnostic(context: d.PluginCtx, sassError: SassException, filePath: string) {
  if (sassError == null || context == null) {
    return null;
  }

  const diagnostic: d.Diagnostic = {
    level: 'error',
    type: 'css',
    language: 'scss',
    header: 'sass error',
    code: formatCode(sassError.status),
    relFilePath: null,
    absFilePath: null,
    messageText: formatMessage(sassError.message),
    lines: [],
  };

  if (typeof sassError.file === 'string' && sassError.file !== 'stdin') {
    filePath = sassError.file;
  }

  if (typeof filePath === 'string') {
    diagnostic.language = /(\.scss)$/i.test(filePath) ? 'scss' : 'sass';
    diagnostic.absFilePath = filePath;
    diagnostic.relFilePath = formatFileName(context.config.rootDir, diagnostic.absFilePath);

    const errorLineNumber = sassError.line;
    const errorLineIndex = errorLineNumber - 1;

    diagnostic.lineNumber = errorLineNumber;
    diagnostic.columnNumber = sassError.column;

    if (errorLineIndex > -1) {
      try {
        const sourceText = context.fs.readFileSync(diagnostic.absFilePath) as string;
        const srcLines = sourceText.split(/\r?\n/);

        const errorLine: d.PrintLine = {
          lineIndex: errorLineIndex,
          lineNumber: errorLineNumber,
          text: typeof srcLines[errorLineIndex] === 'string' ? srcLines[errorLineIndex] : '',
          errorCharStart: sassError.column,
          errorLength: 0,
        };

        for (let i = errorLine.errorCharStart; i >= 0; i--) {
          if (STOP_CHARS.indexOf(errorLine.text.charAt(i)) > -1) {
            break;
          }
          errorLine.errorCharStart = i;
        }

        for (let j = errorLine.errorCharStart; j <= errorLine.text.length; j++) {
          if (STOP_CHARS.indexOf(errorLine.text.charAt(j)) > -1) {
            break;
          }
          errorLine.errorLength++;
        }

        if (errorLine.errorLength === 0 && errorLine.errorCharStart > 0) {
          errorLine.errorLength = 1;
          errorLine.errorCharStart--;
        }

        diagnostic.lines.push(errorLine);

        if (errorLine.lineIndex > 0) {
          const previousLine: d.PrintLine = {
            lineIndex: errorLine.lineIndex - 1,
            lineNumber: errorLine.lineNumber - 1,
            text: srcLines[errorLine.lineIndex - 1],
            errorCharStart: -1,
            errorLength: -1,
          };

          diagnostic.lines.unshift(previousLine);
        }

        if (errorLine.lineIndex + 1 < srcLines.length) {
          const nextLine: d.PrintLine = {
            lineIndex: errorLine.lineIndex + 1,
            lineNumber: errorLine.lineNumber + 1,
            text: srcLines[errorLine.lineIndex + 1],
            errorCharStart: -1,
            errorLength: -1,
          };

          diagnostic.lines.push(nextLine);
        }
      } catch (e) {
        console.error(`StyleSassPlugin loadDiagnostic, ${e}`);
      }
    }
  }

  context.diagnostics.push(diagnostic);

  return diagnostic;
}

function formatCode(input: number) {
  let output = '';
  if (input != null) {
    output = String(input);
  }
  return output;
}

function formatMessage(input: string) {
  let output = '';
  if (typeof input === 'string') {
    output = input.split('╷')[0];
  }
  return output;
}

function formatFileName(rootDir: string, fileName: string) {
  if (!rootDir || !fileName) return '';

  fileName = fileName.replace(rootDir, '');
  if (/\/|\\/.test(fileName.charAt(0))) {
    fileName = fileName.substr(1);
  }
  if (fileName.length > 80) {
    fileName = '...' + fileName.substr(fileName.length - 80);
  }
  return fileName;
}

const STOP_CHARS = [
  '',
  '\n',
  '\r',
  '\t',
  ' ',
  ':',
  ';',
  ',',
  '{',
  '}',
  '.',
  '#',
  '@',
  '!',
  '[',
  ']',
  '(',
  ')',
  '&',
  '+',
  '~',
  '^',
  '*',
  '$',
];
