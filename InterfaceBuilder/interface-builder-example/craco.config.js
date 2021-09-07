const path = require("path")
const WebpackBuildNotifierPlugin = require("webpack-build-notifier")

module.exports = {
  webpack: {
    // output: {
    //   filename: "[name].bundle.js",
    //   chunkFilename: "[name].bundle.js",
    //   path: "./build",
    //   publicPath: "build/",
    // },
    devtool: "source-map",
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
