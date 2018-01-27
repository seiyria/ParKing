
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'awesome-typescript-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                // If you are having trouble with urls not resolving add this setting.
                // See https://github.com/webpack-contrib/css-loader#url
                url: false,
                minimize: true,
                sourceMap: true
              }
            },
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/fonts/'
        }
      }
    ]
  },
  plugins:[
    new HTMLWebpackPlugin({
      title: 'Par King'
    }),
    new CopyWebpackPlugin([
      { context: 'src', from: 'assets/**/*' }
    ]),
    new ExtractTextPlugin('index.css')
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
      phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
      p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js')
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    watchContentBase: true,
    contentBase: path.join(__dirname, 'src')
  }
};
