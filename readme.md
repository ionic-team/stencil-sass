# @stencil/sass

This package is used to easily precompile Sass files within Stencil components. Internally this plugin uses a pure JavaScript implementation of [Sass](https://www.npmjs.com/package/sass). Please see the
[Behavioral Differences from Ruby Sass](https://www.npmjs.com/package/sass#behavioral-differences-from-ruby-sass) doc if issues have surfaced since upgrading from previous versions which used used the `node-sass` implementation.

First, npm install within the project:

```
npm install @stencil/sass --save-dev
```

Next, within the project's stencil config, import the plugin and add it to the config's `plugins` property:

#### stencil.config.ts
```ts
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  plugins: [
    sass()
  ]
};
```

During development, this plugin will kick-in for `.scss` or `.sass` style urls, and precompile them to CSS.


## Options

Sass options can be passed to the plugin within the stencil config, which are used directly by `sass`. Please reference [sass documentation](https://www.npmjs.com/package/sass) for all available options. Note that this plugin automatically adds the component's directory to the `includePaths` array.


### Inject Globals Sass Paths

The `injectGlobalPaths` config is an array of paths that automatically get added as `@use` declarations to all components. This can be useful to inject Sass variables, mixins and functions to override defaults of external collections. For example, apps can override default Sass variables of [Ionic components](https://www.npmjs.com/package/@ionic/core). Relative paths within `injectGlobalPaths` should be relative to the stencil config file.

```js
exports.config = {
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/global/variables.scss', //automatically adds namespace 'variables'. 
        'src/global/mixins.scss' //automatically adds namespace 'mixins'
      ]
    })
  ]
};
```

Note that each of these files are always added to each component, so in most cases they shouldn't contain CSS because it'll get duplicated in each component. Instead, `injectGlobalPaths` should only be used for Sass variables, mixins and functions, but does not contain any CSS.

To add a custom namespace to the file, the injectGlobalPaths accepts an array of TS Tuples(arrays) with the filepath in the first position, followed by the namespace.

Here is an example of customizing the namespaces:

```js
exports.config = {
  plugins: [
    sass({
      injectGlobalPaths: [
        ['src/global/variables.scss', 'var'], //can now access variables like this: var.$some-variable
        ['src/global/mixins.scss', '*'], //global namespace, no prefix needed
        'src/global/animations.scss' //namespace defaults to 'animations'
      ]
    })
  ]
};
```
It is also valid to use a combination of both of these methods.  If you don't wish to change the namespace from the default file name, it can be left as a string.

## Related

* [sass](https://www.npmjs.com/package/sass)
* [Stencil](https://stenciljs.com/)
* [Stencil Worldwide Slack](https://stencil-worldwide.slack.com)
* [Ionic Components](https://www.npmjs.com/package/@ionic/core)
* [Ionicons](http://ionicons.com/)


## Contributing

Please see our [Contributor Code of Conduct](https://github.com/ionic-team/ionic/blob/master/CODE_OF_CONDUCT.md) for information on our rules of conduct.