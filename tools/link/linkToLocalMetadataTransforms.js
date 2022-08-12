const linkLibs = require('./linkToLibs');
// [source, linkpath]
linkLibs([
    [
        '../../../libraries/lib_metadata-transforms/packages/lib_metadata-transforms',
        'node_modules/@sstdev/lib_metadata-transforms'
    ],
    [
        '../../../libraries/lib_metadata-transforms/packages/lib_metadata-config',
        'node_modules/@sstdev/lib_metadata-config'
    ]
]);
