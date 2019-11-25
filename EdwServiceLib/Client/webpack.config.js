// Imports: Dependencies
const path = require('path');
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
require("babel-register");

// Our function that generates our html plugins
function generateHtmlPlugins (templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
  return templateFiles.filter(item => item.endsWith('.html')).map(item => {
    // Split names and extension
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]
    // Create new HTMLWebpackPlugin with options
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      hash: true
    })
  })
}

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins('./src')

// Webpack Configuration
const config = {
  
  // Entry
  entry: ['whatwg-fetch', 'url-polyfill', './src/index.js'],
  // Output
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'edw-client-1.0.0.min.js',
    libraryTarget: 'var',
    library: 'edw'
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
    new CopyWebpackPlugin([
      {
          from: 'src/test.js',
          to: 'test.js'
      }
    ])
    /*new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      hash: true
    })*/
  ].concat(htmlPlugins),

  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
};
// Exports
module.exports = config;