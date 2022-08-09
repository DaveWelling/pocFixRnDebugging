const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ReactNative = require('@callstack/repack');

// *******************************************************
// TODO: inject this from Teamcity at build time.
const BRAND = 'sst'; // sst, redbeam
const PROD_DOMAIN_NODE = 'app'; // app, dev, staging, demo
const DISABLE_SYNC = false;
const NO_SOUND = false;
// *******************************************************

const packageInfo = require('./package.json');
const isProductionBuild = process.env.NODE_ENV === 'production';
const __USE_XSTATE_INSPECTOR__ = false;

/**
 * More documentation, installation, usage, motivation and differences with Metro is available at:
 * https://github.com/callstack/repack/blob/main/README.md
 *
 * The API documentation for the functions and plugins used in this file is available at:
 * https://re-pack.netlify.app/
 */

/**
 * This is the Webpack configuration file for your React Native project.
 * It can be used in 2 ways:
 * - by running React Native CLI eg: `npx react-native start` or `npx react-native bundle`
 * - by running Webpack CLI eg: `PLATFORM=(ios|android) npx webpack-cli -c webpack.config.js`
 *
 * Depending on which option you chose the output might be different, since when running with
 * React Native CLI most of the values from `getMode`, `getPlatform`, etc. will be filled in by React Native CLI.
 * However, when running with Webpack CLI, you might want to tweak `fallback` values to your liking.
 *
 * Please refer to the API documentation for list of options, plugins and their descriptions.
 */

/**
 * Get options from React Native CLI when Webpack is run from `react-native start` or `react-native bundle`.
 *
 * If you run Webpack using Webpack CLI, the values from `fallback` will be used - use it
 * to specify your values, if the defaults don't suit your project.
 */

//const mode = ReactNative.getMode({ fallback: 'development' });
const mode = isProductionBuild ? 'production' : 'development';
const dev = mode === 'development';
const context = ReactNative.getContext();
const entry = ReactNative.getEntry();
const platform = ReactNative.getPlatform({ fallback: process.env.PLATFORM });
const minimize = ReactNative.isMinimizeEnabled({ fallback: !dev });
const devServer = ReactNative.getDevServerOptions();
const reactNativePath = ReactNative.getReactNativePath();
// hmr is turned off because module.hot is used by nativepack/repack and
// does not support ESM.
devServer.hmr = false;
/**
 * Depending on your Babel configuration you might want to keep it.
 * If you don't use `env` in your Babel config, you can remove it.
 *
 * Keep in mind that if you remove it you should set `BABEL_ENV` or `NODE_ENV`
 * to `development` or `production`. Otherwise your production code might be compiled with
 * in development mode by Babel.
 */
process.env.BABEL_ENV = mode;

/**
 * Webpack configuration.
 */
module.exports = {
    mode,
    /**
     * This should be always `false`, since the Source Map configuration is done
     * by `SourceMapDevToolPlugin`.
     */
    devtool: false,
    context,
    /**
     * `getInitializationEntries` will return necessary entries with setup and initialization code.
     * If you don't want to use Hot Module Replacement, set `hmr` option to `false`. By default,
     * HMR will be enabled in development mode.
     */
    entry: [
        ...ReactNative.getInitializationEntries(reactNativePath, {
            hmr: devServer.hmr
        }),
        entry
    ],
    resolve: {
        /**
         * `getResolveOptions` returns additional resolution configuration for React Native.
         * If it's removed, you won't be able to use `<file>.<platform>.<ext>` (eg: `file.ios.js`)
         * convention and some 3rd-party libraries that specify `react-native` field
         * in their `package.json` might not work correctly.
         */
        ...ReactNative.getResolveOptions(platform),

        /**
         * Uncomment this to ensure all `react-native*` imports will resolve to the same React Native
         * dependency. You might need it when using workspaces/monorepos or unconventional project
         * structure. For simple/typical project you won't need it.
         */
        alias: {
            //'@babel/runtime': path.resolve('./node_modules/@babel/runtime'),
            //'@sstdev/lib_logging': path.resolve('./node_modules/@sstdev/lib_logging'),
            'react-native': reactNativePath,
            //'styled-components': path.resolve('../node_modules/styled-components/native'),
            react: path.resolve('./node_modules/react'),
            // '@emotion/native': path.resolve('./node_modules/@emotion/native'),
            'styled-components': path.resolve('./node_modules/styled-components/native'),
            //'react-native-svg': path.resolve('./node_modules/react-native-svg'),
            //'react-native-exception-handler': path.resolve('./node_modules/react-native-exception-handler'),
            //'react-native-pager-view': path.resolve('./node_modules/react-native-pager-view'),
            //'react-native-swipe-gestures': path.resolve('./node_modules/react-native-swipe-gestures'),
            //'react-router-native': path.resolve('./node_modules/react-router-native'),
            //'react-router': path.resolve('./node_modules/react-router'),
            // '@react-native-community/datetimepicker': path.resolve(
            //     './node_modules/@react-native-community/datetimepicker'
            // ),
            //'@react-native-community/hooks': path.resolve('./node_modules/@react-native-community/hooks'),
            //'@react-native-community/netinfo': path.resolve('./node_modules/@react-native-community/netinfo'),
            //'@react-native-community/slider': path.resolve('./node_modules/@react-native-community/slider'),
            //'react-native-toast-notifications': path.resolve('./node_modules/react-native-toast-notifications'),
            //'react-native-sound': path.resolve('./node_modules/react-native-sound'),
            //'react-native-progress': path.resolve('./node_modules/react-native-progress'),
            //'react-native-text-size': path.resolve('./node_modules/react-native-text-size'),
            //'@react-native-community/checkbox': path.resolve('./node_modules/@react-native-community/checkbox'),
            //stream: path.resolve('./node_modules/stream-browserify')
        },
        fallback: {
            //crypto: require.resolve('crypto-browserify'),
            //buffer: require.resolve('buffer/'),
            //util: require.resolve('util/')
        }
    },
    /**
     * Configures output.
     * It's recommended to leave it as it is unless you know what you're doing.
     * By default Webpack will emit files into the directory specified under `path`. In order for the
     * React Native app use them when bundling the `.ipa`/`.apk`, they need to be copied over with
     * `ReactNative.OutputPlugin`, which is configured by default.
     */
    output: {
        clean: true,
        path: path.join(__dirname, 'build', platform),
        filename: 'index.bundle',
        chunkFilename: '[name].chunk.bundle',
        publicPath: ReactNative.getPublicPath(devServer)
    },
    /**
     * Configures optimization of the built bundle.
     */
    optimization: {
        /** Enables minification based on values passed from React Native CLI or from fallback. */
        minimize,
        /** Configure minimizer to process the bundle. */
        minimizer: [
            new TerserPlugin({
                test: /\.(js)?bundle(\?.*)?$/i,
                /**
                 * Prevents emitting text file with comments, licenses etc.
                 * If you want to gather in-file licenses, feel free to remove this line or configure it
                 * differently.
                 */
                extractComments: false,
                terserOptions: {
                    format: {
                        // remove comments always - javascriptcore has some sort of problem with a comment buried
                        // somewhere in the app or dependencies and keeps saying multiline comment not terminated or similar
                        // without any context at all
                        comments: false
                    }
                }
            })
        ]
    },
    module: {
        /**
         * This rule will process all React Native related dependencies with Babel.
         * If you have a 3rd-party dependency that you need to transpile, you can add it to the
         * `include` list.
         *
         * You can also enable persistent caching with `cacheDirectory` - please refer to:
         * https://github.com/babel/babel-loader#options
         */
        rules: [
            // Do not require the extension to be included in import statements.
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false // disable the behaviour
                }
            },
            {
                test: /\.[jt]sx?$/,
                include: [
                    /node_modules(.*[/\\])+react/,
                    /node_modules(.*[/\\])+@react-native/,
                    /node_modules(.*[/\\])+@react-navigation/,
                    /node_modules(.*[/\\])+@react-native-community/,
                    /node_modules(.*[/\\])+@expo/,
                    /node_modules(.*[/\\])+pretty-format/,
                    /node_modules(.*[/\\])+metro/,
                    /node_modules(.*[/\\])+abort-controller/,
                    /node_modules(.*[/\\])+@callstack[/\\]repack/,
                    /node_modules(.*[/\\])+@sstdev/,
                    /node_modules(.*[/\\])+rulesengine.io/
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['module:metro-react-native-babel-preset']
                    }
                }
            },
            /**
             * Here you can adjust loader that will process your files.
             *
             * You can also enable persistent caching with `cacheDirectory` - please refer to:
             * https://github.com/babel/babel-loader#options
             */
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // disableImportExportTransform will remove the transform to commonjs modules.  If you don't
                        // have this, then it will stick require and export statements into your ESM code (and that will
                        // crash if you have `type: module` in your package.json).
                        presets: [['module:metro-react-native-babel-preset', { disableImportExportTransform: true }]],
                        /** Add React Refresh transform only when HMR is enabled. */
                        plugins: devServer.hmr ? ['module:react-refresh/babel'] : undefined
                    }
                }
            },
            { test: /\.css$/i, use: ['to-string-loader', 'css-loader'] },
            /**
             * This loader handles all static assets (images, video, audio and others), so that you can
             * use (reference) them inside your application.
             *
             * If you wan to handle specific asset type manually, filter out the extension
             * from `ASSET_EXTENSIONS`, for example:
             * ```
             * ReactNative.ASSET_EXTENSIONS.filter((ext) => ext !== 'svg')
             * ```
             */
            {
                test: ReactNative.getAssetExtensionsRegExp(ReactNative.ASSET_EXTENSIONS),
                use: {
                    loader: '@callstack/repack/assets-loader',
                    options: {
                        platform,
                        devServerEnabled: devServer.enabled,
                        /**
                         * Defines which assets are scalable - which assets can have
                         * scale suffixes: `@1x`, `@2x` and so on.
                         * By default all images are scalable.
                         */
                        scalableAssetExtensions: ReactNative.SCALABLE_ASSETS
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }), // dropping locales makes moment WAY smaller.
        // jsonwebtoken and crypto are node libraries which are referenced by lib_encryption, but not used on the client side.
        new webpack.IgnorePlugin({ resourceRegExp: /.d.ts/ }), // ignore typescript types
        // Make browser version avoid using Node specific stuff
        new webpack.NormalModuleReplacementPlugin(/^fs$/, path.resolve(__dirname, 'fakeFs.js')),
        /**
         * Various libraries like React and React rely on `process.env.NODE_ENV` / `__DEV__`
         * to distinguish between production and development
         */
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(mode),
                LOG_CONTEXT_INFO: JSON.stringify('reactnative')
            },
            __DEV__: JSON.stringify(dev),
            __USE_XSTATE_INSPECTOR__,
            __PRODUCTION__: isProductionBuild,
            __PERSIST_TO_MEM_ONLY__: false,
            __SST_REACT_NATIVE__: true,
            __UNIT_TESTING__: false,
            __PACKAGE_VERSION__: JSON.stringify(process.env.BUILD_NUMBER || packageInfo.version),
            __BRAND__: JSON.stringify(BRAND),
            __PROD_DOMAIN_NODE__: JSON.stringify(PROD_DOMAIN_NODE),
            __DISABLE_SYNC__: isProductionBuild ? false : DISABLE_SYNC,
            __NO_SOUND__: NO_SOUND,
            __TEST_RFID__: false

        }),

        /**
         * This plugin makes sure the resolution for assets like images works with scales,
         * for example: `image@1x.png`, `image@2x.png`.
         */
        new ReactNative.AssetsResolverPlugin({
            platform
        }),

        /**
         * React Native environment (globals and APIs that are available inside JS) differ greatly
         * from Web or Node.js. This plugin ensures everything is setup correctly so that features
         * like Hot Module Replacement will work correctly.
         */
        new ReactNative.TargetPlugin(),

        /**
         * By default Webpack will emit files into `output.path` directory (eg: `<root>/build/ios`),
         * but in order to for the React Native application to include those files (or a subset of those)
         * they need to be copied over to correct output directories supplied from React Native CLI
         * when bundling the code (with `webpack-bundle` command).
         * All remote chunks will be placed under `remoteChunksOutput` directory (eg: `<root>/build/<platform>/remote` by default).
         * In development mode (when development server is running), this plugin is a no-op.
         */
        new ReactNative.OutputPlugin({
            platform,
            devServerEnabled: devServer.enabled,
            remoteChunksOutput: path.join(__dirname, 'build', platform, 'remote')
        }),

        /**
         * Runs development server when running with React Native CLI start command or if `devServer`
         * was provided as s `fallback`.
         */
        new ReactNative.DevServerPlugin({
            platform,
            ...devServer
        }),

        /**
         * Configures Source Maps for the main bundle based on CLI options received from
         * React Native CLI or fallback value..
         * It's recommended to leave the default values, unless you know what you're doing.
         * Wrong options might cause symbolication of stack trace inside React Native app
         * to fail - the app will still work, but you might not get Source Map support.
         */
        new webpack.SourceMapDevToolPlugin({
            test: /\.(js)?bundle$/,
            exclude: /\.chunk\.(js)?bundle$/,
            filename: '[file].map',
            append: `//# sourceMappingURL=[url]?platform=${platform}`
            /**
             * Uncomment for faster builds but less accurate Source Maps
             */
            // columns: false,
        }),

        /**
         * Configures Source Maps for any additional chunks.
         * It's recommended to leave the default values, unless you know what you're doing.
         * Wrong options might cause symbolication of stack trace inside React Native app
         * to fail - the app will still work, but you might not get Source Map support.
         */
        new webpack.SourceMapDevToolPlugin({
            test: /\.(js)?bundle$/,
            include: /\.chunk\.(js)?bundle$/,
            filename: '[file].map',
            append: `//# sourceMappingURL=[url]?platform=${platform}`
            /**
             * Uncomment for faster builds but less accurate Source Maps
             */
            // columns: false,
        }),

        /**
         * Logs messages and progress.
         * It's recommended to always have this plugin, otherwise it might be difficult
         * to figure out what's going on when bundling or running development server.
         */
        new ReactNative.LoggerPlugin({
            platform,
            devServerEnabled: devServer.enabled,
            output: {
                console: true
                /**
                 * Uncomment for having logs stored in a file to this specific compilation.
                 * Compilation for each platform gets it's own log file.
                 */
                // file: path.join(__dirname, `${mode}.${platform}.log`),
            }
        })
    ]
};
