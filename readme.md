# @stencil/sass

This package is used to easily precompile Sass files within the Stencil components.

First, npm install within the project:

```
npm install @stencil/sass --save-dev
```

Next, within the project's `stencil.config.js` file, import the plugin and add it to the config's `plugins` config:

```js
const sass = require('@stencil/sass');

exports.config = {
  plugins: [
    sass()
  ]
};
```

During development, this plugin will kick-in for `.scss` or `.sass` style urls, and precompile them to CSS.


## Options

Sass options can be passed to the plugin within `stencil.config.js`, which are used directly by `node-sass`. Please reference [node-sass documentation](https://www.npmjs.com/package/node-sass) for all available options. Note that this plugin automatically adds the component's directory to the `includePaths` array.


### Inject Globals Sass Paths

The `injectGlobalPaths` config is an array of paths that automatically get added as `@import` declarations to all components. This can be useful to inject Sass variables, mixins and functions to override defaults of external collections. For example, apps can override default Sass variables of [Ionic components](https://www.npmjs.com/package/@ionic/core). Relative paths within `injectGlobalPaths` should be relative to the `stencil.config.js` file.

```js
exports.config = {
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/globals/variables.scss',
        'src/globals/mixins.scss'
      ]
    })
  ]
};
```

Note that each of these files are always added to each component, so in most cases they shouldn't contain CSS because it'll get duplicated in each component. Instead, `injectGlobalPaths` should only be used for Sass variables, mixins and functions, but not contain any CSS.


## Related

* [node-sass](https://www.npmjs.com/package/node-sass)
* [Stencil](https://stenciljs.com/)
* [Stencil Worldwide Slack](https://stencil-worldwide.slack.com)
* [Ionic Components](https://www.npmjs.com/package/@ionic/core)
* [Ionicons](http://ionicons.com/)


## Contributing

Please see our [Contributor Code of Conduct](https://github.com/ionic-team/ionic/blob/master/CODE_OF_CONDUCT.md) for information on our rules of conduct.