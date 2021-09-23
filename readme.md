# @stencil/sass

This package is used to easily precompile Sass files within Stencil components using [`sass`](https://www.npmjs.com/package/sass). Please see the
[Behavioral Differences from Ruby Sass](https://www.npmjs.com/package/sass#behavioral-differences-from-ruby-sass) doc if issues have surfaced since upgrading from previous versions which used used the `node-sass` implementation.

First, npm install within the project:

```
npm install @stencil/sass sass --save-dev
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

The `injectGlobalPaths` config is an array of paths that automatically get added as imports to all components. This can be useful to inject Sass variables, mixins and functions to override defaults of external collections. For example, apps can override default Sass variables of [Ionic components](https://www.npmjs.com/package/@ionic/core). Relative paths within `injectGlobalPaths` should be relative to the stencil config file.

#### v1 

v1.x of stencil/sass uses sass `@import` syntax to add files listed in the `injectGlobalPaths` option to each stylesheet.  Do not use `@use` in your components if using v1 because it is not permitted by sass to have `@import` statements before `@use` statements.  Below is an example of using `injectGlobalPaths` in v1.

```js
exports.config = {
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/global/variables.scss', //adds @import 'src/global/variables.scss' statement
        'src/global/mixins.scss' //adds @import 'src/global/mixins.scss' statement
      ]
    })
  ]
};
```

#### v2

v2.x of stencil/sass uses sass `@use` syntax to add files listed in `injectGlobalPaths` to each stylesheet.  Because the `@use` syntax also supports namespacing by default, the option is now available to customize the namespace. `injectGlobalPaths` can now be an array of TS tuples.  The first position is the filepath and the second position is the namespace.  There is still the option to only use a string, which will default the namespace to the name of the file. These methods can be combined.

```js
exports.config = {
  plugins: [
    sass({
      injectGlobalPaths: [
        ['src/global/variables.scss', 'var'], //adds "@use 'src/global/variables.scss' as var" statement
        ['src/global/mixins.scss', '*'], //root namespace, no prefix needed to access
        'src/global/animations.scss' //namespace defaults to 'animations'
      ]
    })
  ]
};
```

Note that each of these files are always added to each component, so in most cases they shouldn't contain CSS because it'll get duplicated in each component. Instead, `injectGlobalPaths` should only be used for Sass variables, mixins and functions, but does not contain any CSS.


## Related

* [sass](https://www.npmjs.com/package/sass)
* [Stencil](https://stenciljs.com/)
* [Stencil Worldwide Slack](https://stencil-worldwide.slack.com)
* [Ionic Components](https://www.npmjs.com/package/@ionic/core)
* [Ionicons](http://ionicons.com/)


## Contributing

Please see our [Contributor Code of Conduct](https://github.com/ionic-team/ionic/blob/master/CODE_OF_CONDUCT.md) for information on our rules of conduct.