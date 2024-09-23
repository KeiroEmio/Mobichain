webpack: {
    plugins: [/** */],
    configure: (webpackConfig, { env: webpackEnv, paths }) => {
            webpackConfig.optimization.splitChunks = {
                ...webpackConfig.optimization.splitChunks,
                cacheGroups: {
                    base: {
                        // 基本框架
                        chunks: 'all',
                        test: /(react|react-dom|react-dom-router)/,
                        name: 'base',
                        priority: 100,
                    },
                    jsoneditor: {
                        test: /jsoneditor/,
                        name: 'jsoneditor',
                        priority: 100,
                    },
                    echarts: {
                        test: /(echarts)/,
                        name: 'echarts',
                        priority: 100,
                    },
                    g2: {
                        test: /@antv/,
                        name: 'g2',
                        priority: 100,
                    },
                    commons: {
                        chunks: 'all',
                        // 将两个以上的chunk所共享的模块打包至commons组。
                        minChunks: 2,
                        name: 'commons',
                        priority: 80,
                    },
                },
            };
            return webpackConfig;
        },
}
