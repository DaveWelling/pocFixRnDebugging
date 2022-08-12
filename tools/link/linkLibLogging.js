const linkLibs = require('./linkToLibs');
// [source, linkpath]
linkLibs([
    [
        '../../libraries/lib_logging',
        'lib_ui/node_modules/@sstdev/lib_logging'
    ],
    [
        '../../libraries/lib_logging',
        'lib_ui-state-management/node_modules/@sstdev/lib_logging'
    ],
    [
        '../../libraries/lib_logging',
        'lib_ui-material-authentication/node_modules/@sstdev/lib_logging'
    ],
    [
        '../../libraries/lib_logging',
        'silo_ui-web/node_modules/@sstdev/lib_logging'
    ]
]);