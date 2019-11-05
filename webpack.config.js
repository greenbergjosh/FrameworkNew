const path = require("path")

const PATHS = {
  src: path.join(__dirname, "./src"),
  dist: path.join(__dirname, "./dist"),
}

module.exports = {
  entry: {
    "interface-builder": PATHS.src + "/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  devtool: "source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: PATHS.dist,
    filename: "[name].js",
    library: "InterfaceBuilder",
    libraryTarget: "umd",
  },
}
