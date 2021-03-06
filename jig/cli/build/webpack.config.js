const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevelopment = process.env.DEV;

const developmentPlugins = [];

if (process.env.SHOW_BUNDLE_REPORT) {
    developmentPlugins.push(new BundleAnalyzerPlugin())
}

function getMinimizer() {
    if (isDevelopment) {
        return [];
    }

    return [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                keep_classnames: true,
                ecma: 6,
            },
        })
    ];
}

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    plugins: [
        ...developmentPlugins,
        new webpack.IgnorePlugin(/jsdom/),
        new webpack.IgnorePlugin(/mutationobserver-shim/),
    ],
    module: {
        rules: [
            {
                test: /\.*.ts$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    output: {
        jsonpFunction: 'jigJsonpFlightsWidget',
        filename: '[name].app.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve('./dist'),
        publicPath: '/'
    },
    optimization: {
        usedExports: true,
        minimizer: getMinimizer()
    },
    node: {
        net: 'empty',
        fs: 'empty',
        tls: 'empty',
        process: false,
        child_process: 'empty',
        jsdom: 'empty',
        'mutationobserver-shim': 'empty',
    }
};
