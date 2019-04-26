import { Options } from 'sass';


export interface PluginOptions extends Options {
  injectGlobalPaths?: string[];
}

export interface PluginTransformResults {
  code?: string;
  id?: string;
  originalId?: string;
  diagnostics?: Diagnostic[];
}

export interface PluginCtx {
  config: {
    rootDir?: string;
    srcDir?: string;
  };
  fs: any;
  diagnostics: Diagnostic[];
}

export interface Diagnostic {
  level: 'error' | 'warn' | 'info' | 'log' | 'debug';
  type: 'typescript' | 'bundling' | 'build' | 'runtime' | 'hydrate' | 'css';
  header?: string;
  language?: string;
  messageText: string;
  code?: string;
  absFilePath?: string;
  relFilePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  lines?: PrintLine[];
}

export interface PrintLine {
  lineIndex: number;
  lineNumber: number;
  text?: string;
  errorCharStart: number;
  errorLength?: number;
}
