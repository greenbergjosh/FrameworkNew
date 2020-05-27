const path = require("path")
const { override, fixBabelImports } = require("customize-cra")
const  WebpackNotifierPlugin = require('webpack-notifier')

/**
 * See for more info:
 * https://ant.design/docs/react/use-with-create-react-app
 * https://www.npmjs.com/package/babel-plugin-import
 * https://github.com/arackaf/customize-cra/blob/master/api.md#fixbabelimportslibraryname-options
 * @type {Function[]}
 */
const overrides = [
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
  }),
]

/**
 * @param {import('webpack').Configuration} config
 * @param {"development" | "production"} env
 */
module.exports = function customizeCRA(config, env) {
  config.devtool = "source-map"
  config.plugins = config.plugins || []
  config.module.rules = config.module.rules || []

  // // This may be necessary for react-monaco-editor according to docs:
  // // https://github.com/react-monaco-editor/react-monaco-editor/tree/2df830b0fe953527905950c79b02f935221f7186#using-with-webpack
  // // I dug into the react-script webpack config to find where to override
  // const rule = config.module.rules.find((r) => Array.isArray(r.oneOf))
  // rule.oneOf.splice(-1, 0, {
  //   test: /\.css$/,
  //   include: path.resolve(__dirname, "./node_modules/monaco-editor"),
  //   use: ["style-loader", "css-loader"],
  // })

  config.plugins.push(new WebpackNotifierPlugin())
  return override(...overrides)(config, env)
}
