/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

// corejs modules _microtask

const path = require('path');
const webpack = require('webpack');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { bundler, styles } = require('@ckeditor/ckeditor5-dev-utils');
const glob = require('glob');
const postCSSConfig = styles.getPostCssConfig({
  themeImporter: {
    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
  },
  minify: false,
});
const { DuplicatesPlugin } = require('inspectpack/plugin');

postCSSConfig.plugins.push(
  require('postcss-custom-properties')({
    importFrom: glob.sync('./../../**/theme/**/*.css'),
  })
);

module.exports = {
  devtool: 'source-map',
  performance: { hints: false },

  entry: [path.resolve(__dirname, 'app.js')],

  resolve: {
    modules: [path.resolve(__dirname, '../../node_modules'), path.resolve(__dirname, 'node_modules')],
  },

  output: {
    // The name under which the editor will be exported.
    library: 'ClassicEditor',

    path: path.resolve(__dirname, 'build'),
    filename: 'ckeditor-classic.js',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'home',
      filename: 'index.html',
      template: './src/index.html',
      inject: false,
    }),
    new DuplicatesPlugin({
      // Emit compilation warning or error? (Default: `false`)
      emitErrors: false,
      // Display full duplicates information? (Default: `false`)
      verbose: false,
    }),
    new CKEditorWebpackPlugin({
      // UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
      // When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
      language: 'ru',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['raw-loader'],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              singleton: true,
            },
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: postCSSConfig,
          },
        ],
      },
    ],
  },
};
