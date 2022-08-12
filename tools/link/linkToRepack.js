const linkLibs = require('./linkToLibs');
// [source, linkpath]
linkLibs([
    [
        '../repack/packages/repack',
        'DreadfulProject/node_modules/@callstack/repack'
    ],
    [
        '../repack/packages/debugger-app',
        'DreadfulProject/node_modules/@callstack/repack-debugger-app'
    ],
    [
        '../repack/packages/dashboard',
        'DreadfulProject/node_modules/@callstack/dashboard'
    ],
    [
        '../repack/packages/dev-server',
        'DreadfulProject/node_modules/@callstack/repack-dev-server'
    ]
]);
