'use strict';

const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/public/templates/home.html',
    filename: '../../views/home.html',
    inject: 'body'
});

const UglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
    minimize: true
});

module.exports = {
    entry: {
        transformed: __dirname + '/public/js/main.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/public/js/generated/'
    },
    devServer: {
        publicPath: "./public/",
        contentBase: "./public/views/",
        port: 9001,
        proxy: {
            "/static": "http://localhost:3000"
        }
    },
    plugins: []
};