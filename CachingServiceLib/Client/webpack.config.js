// Imports: Dependencies
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin')
require("babel-register");

// Webpack Configuration
const config = {
  
  // Entry
  entry: ['whatwg-fetch', 'url-polyfill', './src/index.js'],
  // Output
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'edw-client-1.0.0.min.js',
    libraryTarget: 'var',
    library: 'EdwClient'
  },
  // Loaders
  module: {
    rules : [
      // JavaScript/JSX Files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      // CSS Files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  // Plugins
  plugins: [
    new htmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      hash: true
    })
  ],

  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
};
// Exports
module.exports = config;