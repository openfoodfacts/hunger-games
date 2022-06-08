const path = require('path');
const glob = require('glob');

module.exports = {
  mode: 'production',
  entry: {
    'bundle.js': glob
      .sync('build/static/?(js|css)/*.?(js|css)')
      .map(f => path.resolve(__dirname, f)),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.min.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
