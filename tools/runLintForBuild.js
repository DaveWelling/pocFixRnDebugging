const path = require('path');
const package = require('../package.json');

const { spawnSerially } = require('./spawn');

// Get a list of all subpackages with relative directories.
// Array = [[package's path to eslint, eslint cmdline parms, package's working directory, use OS shell = true], ... ]
let runAll = Object.keys(package.othernpm).reduce(
    (result, subpackage) =>
        result.concat([
            ['echo', [`##teamcity[blockOpened name='Linting ${subpackage}']`]],
            [
                path.join(__dirname, '..', 'node_modules/.bin/eslint'),
                ['--ignore-path', '../.gitignore', '.'],
                package.othernpm[subpackage],
                true
            ],
            ['echo', [`##teamcity[blockClosed name='Linting ${subpackage}']`]]
        ]),
    []
);

spawnSerially(runAll, false)
    .then(errors => {
        if (errors.length) {
            errors.forEach(err => {
                console.error('An error occur while linting: ', err.stack || err.message || err.toString());
            });
            process.exit(1); // fail build.
        } else {
            console.log('Done with all linting.');
        }
    })
    .catch(err => {
        console.error('An error occur while linting: ', err.stack || err.message || err.toString());
        process.exit(1); // fail build.
    });
