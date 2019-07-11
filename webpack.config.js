module.exports = {
  // entry: ['babel-polyfill'],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    // eslint-disable-next-line
    filename: 'bundle.js',
  },
  devServer: {
    open: true,
    inline: true,
    contentBase: './public/',
  },
};
