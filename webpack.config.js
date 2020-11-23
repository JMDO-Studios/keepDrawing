module.exports = {
  mode: 'development',
  entry: './client/index.js',
  output: {
    path: __dirname,
    filename: './public/bundle.js',
  },
  context: __dirname,
  devtool: 'source-map',
};
