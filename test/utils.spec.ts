import * as d from '../src/declarations';
import * as util from '../src/util';


describe('getRenderOptions', () => {

  const sourceText = 'body { color: blue; }';
  const fileName = '/some/path/file-name.scss';
  const context: d.PluginCtx = {
    config: {
      rootDir: '/Users/my/app/',
      srcDir: '/Users/my/app/src/',
    },
    fs: {} as any,
    diagnostics: []
  } as any;


  it('should remove "file" config', () => {
    const input: d.PluginOptions = {
      file: '/my/global/variables.scss'
    };
    const output = util.getRenderOptions(input, sourceText, fileName, context);
    expect(output.data).toBe(`body { color: blue; }`);
    expect(output.file).toBeUndefined();
  });

  it('should inject global sass array and not change input options or include globals in output opts', () => {
    const input: d.PluginOptions = {
      injectGlobalPaths: ['/my/global/variables.scss']
    };
    const output = util.getRenderOptions(input, sourceText, fileName, context);
    expect(output.data).toBe(`@import "/my/global/variables.scss";body { color: blue; }`);
    expect(output.injectGlobalPaths).toBeUndefined();
    expect(input.injectGlobalPaths).toHaveLength(1);
    expect(input.injectGlobalPaths[0]).toBe('/my/global/variables.scss');
  });

  it('should add dirname of filename to existing includePaths array and not change input options', () => {
    const input: d.PluginOptions = {
      includePaths: ['/some/other/include/path']
    };
    const output = util.getRenderOptions(input, sourceText, fileName, context);
    expect(output.includePaths).toHaveLength(2);
    expect(output.includePaths[0]).toBe('/some/other/include/path');
    expect(output.includePaths[1]).toBe('/some/path');
    expect(input.includePaths).toHaveLength(1);
    expect(input.includePaths[0]).toBe('/some/other/include/path');
  });

  it('should add dirname of filename to includePaths and not change input options', () => {
    const input: d.PluginOptions = {};
    const output = util.getRenderOptions(input, sourceText, fileName, context);
    expect(output.includePaths).toHaveLength(1);
    expect(output.includePaths[0]).toBe('/some/path');
    expect(input.includePaths).toBeUndefined();
  });

  it('should set data', () => {
    const input: d.PluginOptions = {};
    const output = util.getRenderOptions(input, sourceText, fileName, context);
    expect(output.data).toBe(sourceText);
  });

});


describe('usePlugin', () => {

  it('should use the plugin for .scss file', () => {
    const fileName = 'my-file.scss';
    expect(util.usePlugin(fileName)).toBe(true);
  });

  it('should use the plugin for .sass file', () => {
    const fileName = 'my-file.sass';
    expect(util.usePlugin(fileName)).toBe(true);
  });

  it('should not use the plugin for .pcss file', () => {
    const fileName = 'my-file.pcss';
    expect(util.usePlugin(fileName)).toBe(false);
  });

  it('should not use the plugin for .css file', () => {
    const fileName = 'my-file.css';
    expect(util.usePlugin(fileName)).toBe(false);
  });

});

describe('createResultsId', () => {

  it('should change scss the extension to be css', () => {
    const input = '/my/path/my-file.scss';
    const output = util.createResultsId(input);
    expect(output).toBe('/my/path/my-file.css');
  });

  it('should change sass the extension to be css', () => {
    const input = '/my/path.DIR/my-file.whatever.SOME.dots.SASS';
    const output = util.createResultsId(input);
    expect(output).toBe('/my/path.DIR/my-file.whatever.SOME.dots.css');
  });

});

describe('getModuleId', () => {

  it('getModuleId non-scoped ~ package', () => {
    const m = util.getModuleId('~ionicons/dist/css/ionicons.css');
    expect(m.moduleId).toBe('ionicons');
    expect(m.filePath).toBe('dist/css/ionicons.css');
  });

  it('getModuleId non-scoped package', () => {
    const m = util.getModuleId('ionicons/dist/css/ionicons.css');
    expect(m.moduleId).toBe('ionicons');
    expect(m.filePath).toBe('dist/css/ionicons.css');
  });

  it('getModuleId non-scoped package, no path', () => {
    const m = util.getModuleId('ionicons');
    expect(m.moduleId).toBe('ionicons');
    expect(m.filePath).toBe('');
  });

  it('getModuleId scoped ~ package', () => {
    const m = util.getModuleId('~@ionic/core/dist/ionic/css/ionic.css');
    expect(m.moduleId).toBe('@ionic/core');
    expect(m.filePath).toBe('dist/ionic/css/ionic.css');
  });

  it('getModuleId scoped package', () => {
    const m = util.getModuleId('@ionic/core/dist/ionic/css/ionic.css');
    expect(m.moduleId).toBe('@ionic/core');
    expect(m.filePath).toBe('dist/ionic/css/ionic.css');
  });

  it('getModuleId scoped package, no path', () => {
    const m = util.getModuleId('@ionic/core');
    expect(m.moduleId).toBe('@ionic/core');
    expect(m.filePath).toBe('');
  });

});