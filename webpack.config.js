module.exports = {
  entry: ['regenerator-runtime/runtime', './src/app/frontend/index.js'],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
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
