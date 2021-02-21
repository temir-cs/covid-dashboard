const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const path = require('path');

const { NODE_ENV } = process.env;

module.exports = {
    entry: {
        index: [path.resolve(__dirname, 'src', 'js/index.js'),
            path.resolve(__dirname, 'src', 'scss/style.scss')],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    ((NODE_ENV == 'development') ? 'style-loader' : MiniCssExtractPlugin.loader),
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            url: false,
                        },
                    }, {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['eslint-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'html/index.html'),
            title: 'Covid Dashboard',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/assets', to: './assets' },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
        new CleanWebpackPlugin(),
    ],
    devServer: {
        open: true,
    },
    externals: {
        moment: 'moment'
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};
