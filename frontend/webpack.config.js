const path = require('path');

module.exports = {
  entry: './src/index.js', // Your entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' // Output bundle file
  },
  module: {
    resolve: {
    // 扩展或修改 resolve 配置
    fallback: {
      "crypto": false // 显式指定不包括 'crypto' 模块
    },
    // 如果您还需要配置别名
    alias: {
      // 指定别名
      // '某个模块': path.resolve(__dirname, 'path/to/your/module')
    },
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // This loader compiles your modern JS down to ES5
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
    resolve: {
    // 1.不需要node polyfilss
    alias: {
      crypto: false
    },
  },
  }
}
};
