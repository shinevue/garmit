/// <binding ProjectOpened='webpack' />
/**
 * このファイルは、JavaScript、JSXのトランスパイルを自動で行うための設定ファイルです。
 * JavaScript/JSXは、webpackを利用して一ファイルに結合します。
 * ファイル結合の設定は、webpack.config.js に記述してください。
 */

var webpack = require("webpack");

module.exports = function (grunt) {

    var webpackConfig = require("./webpack.config.js");

    grunt.loadNpmTasks("grunt-webpack");
    grunt.initConfig({

        webpack: webpackConfig,     //SCSSとJSX用の二つのタスク
        "webpack-dev-server": {
            options: {
                webpack: {
                    // configuration for all builds
                }
                // server and middleware options for all builds
            },
            start: {
                webpack: {
                    // configuration for this build
                }
                // server and middleware options for this build
            }
        }
    });

    // デフォルトタスクの登録
    grunt.registerTask('default', ['webpack']);
};
