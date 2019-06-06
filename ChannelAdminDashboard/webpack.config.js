const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    components: ['babel-polyfill', './Content/components/index.js'],
  },
  output: {
    filename: '[name].js',
    globalObject: 'this',
    path: path.resolve(__dirname, 'wwwroot/dist'),
    publicPath: 'dist',
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  optimization: {
    runtimeChunk: {
      name: 'runtime', // necessary when using multiple entrypoints on the same page
    },
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /^old_/],
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|woff2?|eot)$/,
        exclude: [/^old_/],
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: './',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: [/^old_/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../',
            },
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new CopyPlugin([
      {from: './Content/components/static', to: ''},
    ]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
}
