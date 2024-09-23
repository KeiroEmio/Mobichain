// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 配置模块解析的 fallback
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        zlib: require.resolve('browserify-zlib'),
        process: require.resolve('process/browser'), // 添加 process 的替代
      };

      // 使用 ProvidePlugin 全局定义 process
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ];

      // 忽略 zlib_bindings 模块
      webpackConfig.module.rules.push({
        test: /zlib_bindings/,
        use: 'null-loader',
      });

      return webpackConfig;
    },
  },
};
