// This file is mostly (or fully) copied from here:
// https://code.visualstudio.com/api/working-with-extensions/bundling-extension#configure-webpack

//@ts-check

'use strict'

const path = require('path')
const webpack = require('webpack')

{
  require.resolve('assert')
}

/** @typedef {import('webpack').Configuration} WebpackConfig **/

function createExtensionConfig ({ target, output }) {
  return {
    target,
    entry: './src/extension.ts',
    output,
    devtool: 'source-map',
    externals: {
      vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      extensions: ['.ts'],
      alias: {},
      fallback: {
        util: false,
        child_process: false
      }
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader'
            }
          ]
        }
      ]
    }
  }
}

const nodeExtensionConfig = createExtensionConfig({
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  }
})

const webExtensionConfig = createExtensionConfig({
  target: 'webworker',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist/web'),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  }
})

module.exports = [webExtensionConfig, nodeExtensionConfig]
