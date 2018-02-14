# @stencil/sass

This package is used in order to easily precompile Sass files within the Stencil compiler.

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

Sass options can be passed to the plugin within `stencil.config.js`, which are used directly by `node-sass`. Please reference [node-sass documentation](https://www.npmjs.com/package/node-sass) for all available options.

```js
exports.config = {
  plugins: [
    sass({ includePaths: ['/my-include-path'] })
  ]
};
```


## Related

* [node-sass](https://www.npmjs.com/package/node-sass)
* [Stencil](https://stenciljs.com/)
* [Stencil Worldwide Slack](https://stencil-worldwide.slack.com)
* [Ionic Components](https://www.npmjs.com/package/@ionic/core)
* [Ionicons](http://ionicons.com/)


## Contributing

Please see our [Contributor Code of Conduct](https://github.com/ionic-team/ionic/blob/master/CODE_OF_CONDUCT.md) for information on our rules of conduct.