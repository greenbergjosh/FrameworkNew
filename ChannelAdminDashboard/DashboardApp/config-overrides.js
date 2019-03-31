const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")
const { override, fixBabelImports } = require("customize-cra")

const overrides = [
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
  }),
]

module.exports = function customizeCRA(config, env) {
  config.plugins = config.plugins || []
  config.plugins.push(new MonacoWebpackPlugin())
  return override(...overrides)(config, env)
}
