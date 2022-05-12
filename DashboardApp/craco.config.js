const path = require("path")
const WebpackBuildNotifierPlugin = require("webpack-build-notifier")

module.exports = {
  devtool: "source-map",
  webpack: {
    /**
     * We remove ModuleScopePlugin restriction set in CRA so we can use
     * webpack.alias for node_modules.
     * @param webpackConfig
     */
    configure: (webpackConfig) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      )

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1)
      return webpackConfig
    },
    alias: {
      react: path.resolve("./node_modules/react"),
      antd: path.resolve("./node_modules/antd"),
      "@ant-design": path.resolve("./node_modules/@ant-design"),
    },
    rules: [
      {
        // https://v4.webpack.js.org/loaders/svg-inline-loader/
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
    ],
    plugins: [new WebpackBuildNotifierPlugin()],
  },
}
