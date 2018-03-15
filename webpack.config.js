const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

//node js The path module provides utilities for working with file and directory paths. It can be accessed using:
const path = require("path");

const PATHS = {
    app: path.join(__dirname, "src"),
    build: path.join(__dirname, "dist"),
};

const glob = require("glob");

const parts = require("./webpack.parts");

var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var webpackConfig = {
    // ... 
    plugins: [
        new FriendlyErrorsWebpackPlugin(),
    ],
    // ... 
}


const commonConfig = merge([
    {
        plugins: [
            new HtmlWebpackPlugin({
                title: "Webpack demo",
            }),
        ],
    },
    parts.loadJavaScript({ include: PATHS.app }),
    parts.setFreeVariable("HELLO", "hello from config"),

]);

//::::PRODUCTION::::
const productionConfig = merge([
    parts.extractCSS({
        use: ["css-loader", parts.autoprefix()],
    }),

    parts.purifyCSS({
        paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
    }),

    parts.loadImages({
        options: {
            limit: 15000,
            name: "file-loader?[name].[ext]",
        },
    }),
    parts.generateSourceMaps({ type: "source-map" }),

    {
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "all",
                    },
                },
            },
        },
    },
    parts.clean(PATHS.build),
    parts.attachRevision(),


]);

//::::DEVELPMENT::::
const developmentConfig = merge([
    parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT,
    }),
    parts.loadCSS(),
    parts.loadImages(),
    parts.clean(PATHS.build),
    parts.minifyJavaScript(),

    parts.minifyCSS({
        options: {
            discardComments: {
                removeAll: true,
            },
            // Run cssnano in safe mode to avoid
            // potentially unsafe transformations.
            safe: true,
        },
    }),
]);

module.exports = mode => {
    process.env.BABEL_ENV = mode;

    if (mode === "production") {
        return merge(commonConfig, productionConfig, { mode });
    }

    return merge(commonConfig, developmentConfig, { mode });
};

