import ExtractTextPlugin from 'extract-text-webpack-plugin';
import OptimizeCssAssetsPlugin from '../../../src/';

module.exports = {
  entry: './index',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: { loader: 'style-loader' },
          use: {
            loader: 'css-loader',
            options: { minimize: true }
          }
        })
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('file.css'),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /optimize-me\.css/g
    })
  ],
};
