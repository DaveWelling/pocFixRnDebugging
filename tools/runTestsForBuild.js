const path = require('path');
const package = require('../package.json');

const { spawnSerially } = require('./spawn');

const rootDir = path.join(__dirname, '..');
const onpmPath = path.resolve(rootDir, 'node_modules', '.bin', 'onpm');

// Get a list of all subpackages with relative directories.
// Array = [[path to othernpm executable, reporter, root working directory, use OS shell = true], ... ]
const runAll = Object.keys(package.othernpm)
    // .filter(k => k !== 'siloUiReactNative') // Filter out react native until have tests.
    .reduce((result, subPackage) => {
        // get the scripts property from the package.json
        const scripts = require(path.resolve(rootDir, subPackage, 'package.json')).scripts;
        // if package has test:teamcity script, use that, if not use standard test script
        const testScript = scripts['test:teamcity'] ? 'test:teamcity' : 'test';

        return result.concat([
            ['echo', [`##teamcity[testSuiteStarted name='${subPackage}']`]],
            [onpmPath, [subPackage, 'run', testScript], rootDir, true],
            ['echo', [`##teamcity[testSuiteFinished name='${subPackage}']`]]
        ]);
    }, []);

spawnSerially(runAll, false)
    .then(errors => {
        console.log('__________________________________________________________________');
        if (errors.length) {
            errors.forEach(err => {
                console.error('An error occur while running the unit tests: ', err.message || err.toString());
            });
            process.exit(1); // fail build.
        } else {
            console.log('Done with all tests.');
        }
    })
    .catch(err => {
        console.log('__________________________________________________________________');
        console.error('An error occur while running the unit tests: ', err.message || err.toString());
        process.exit(1); // fail build.
    });
