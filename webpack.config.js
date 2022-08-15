const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist'
  },
  devServer: {
    // contentBase: './dist',
    // publicPath: './dist'
    static: {
        directory: path.join(__dirname, '/')
    }
  }
};