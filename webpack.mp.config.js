const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const MpPlugin = require('mp-webpack-plugin') // 用于构建小程序代码的 webpack 插件

const isOptimize = true // 是否压缩业务代码，开发者工具可能无法完美支持业务代码使用到的 es 特性，建议自己做代码压缩

module.exports = {
    mode: 'production',
    entry: {
        // js 入口
        home: path.resolve(__dirname, '../src/home/main.mp.js'),
        list: path.resolve(__dirname, '../src/list/main.mp.js'),
        detail: path.resolve(__dirname, '../src/detail/main.mp.js'),
    },
    output: {
        path: path.resolve(__dirname, './miniprogram/common'), // 放到小程序代码目录中的 common 目录下
        filename: '[name].js', // 必需字段，不能修改
        library: 'createApp', // 必需字段，不能修改
        libraryExport: 'default', // 必需字段，不能修改
        libraryTarget: 'window', // 必需字段，不能修改
    },
    target: 'web', // 必需字段，不能修改
    optimization: {
        runtimeChunk: false, // 必需字段，不能修改
        splitChunks: { // 代码分割配置，不建议修改
            chunks: 'all',
            minSize: 1000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 100,
            maxInitialRequests: 100,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },

        minimizer: isOptimize ? [
            // 压缩CSS
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.(css|wxss)$/g,
                cssProcessor: require('cssnano'),
                cssProcessorPluginOptions: {
                    preset: ['default', {
                        discardComments: {
                            removeAll: true,
                        },
                        minifySelectors: false, // 因为 wxss 编译器不支持 .some>:first-child 这样格式的代码，所以暂时禁掉这个
                    }],
                },
                canPrint: false
            }),
            // 压缩 js
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                parallel: true,
            })
        ] : [],
    },
    module: {
        rules: [
            // loaders 配置。这里需要注意的是，部分在 wxss 不支持的样式需要剔除，比如 ie hack 代码，可以使用 postcss 的 stylehacks 插件剔除；对于资源文件来说，需要转成 base64 或者线上资源链接，下面是一个简单的示例：
            // {
            //     test: /\.(png|jpg|jpeg|gif|svg|eot|woff|woff2|ttf)$/,
            //     use: [{
            //         loader: 'url-loader',
            //         options: {
            //             limit: 1024,
            //             name: '[name]_[hash:hex:6].[ext]',
            //             publicPath: 'https://test.miniprogram.com/res', // 对于资源文件直接使用线上的 cdn 地址
            //             emitFile: false,
            //         }
            //     }],
            // },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.isMiniprogram': process.env.isMiniprogram, // 注入环境变量，用于业务代码判断
        }),
        new MiniCssExtractPlugin({
            filename: '[name].wxss',
        }),
        new MpPlugin({
            // 插件配置，下面会详细介绍
        }),
    ],
}