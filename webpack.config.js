const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/game.ts'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin([
            {
              from: path.resolve(__dirname, './src/index.html'),
              to: path.resolve(__dirname, 'build')
            }
          ])
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                transpileOnly: true // IMPORTANT! use transpileOnly mode to speed-up compilation
            }
        }]
    }
};