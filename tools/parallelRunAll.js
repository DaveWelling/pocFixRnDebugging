const path = require('path');
const packageConfig = require('../package.json');
const chalk = require('chalk');
const { spawnParallel } = require('./spawn');

const [, , command, doRootText, forTeamCityText, ...remainingArgs] = process.argv;

// Check to see if this NPM command should also be run on the root.
const doRoot = doRootText !== 'false';
const forTeamCity = forTeamCityText !== 'false';

// If there are additional NPM args, appends those.
let npmArgs;
if (command === 'i') {
    npmArgs = ['i'];
    if (remainingArgs.length) {
        npmArgs = ['i', ...remainingArgs];
    }
} else if (remainingArgs.length) {
    npmArgs = ['run', command, '--', ...remainingArgs];
} else {
    npmArgs = ['run', command];
}

// NEED TO SET NODE_ENV TO development WHILE RUNNING THIS.
// With the --production flag (or when the NODE_ENV environment variable is set to production),
// npm will not install modules listed in devDependencies.

// Get a list of all subpackages with relative directories.
// Array = [[package's path to eslint, eslint cmdline parms, package's working directory, use OS shell = true], ... ]
let runAll = Object.keys(packageConfig.othernpm).reduce(
    (result, subpackage) =>
        result.concat([
            [subpackage, 'npm', npmArgs, packageConfig.othernpm[subpackage], true, { NODE_ENV: 'development' }]
        ]),
    []
);

if (doRoot) {
    runAll.push(['root', 'npm', npmArgs, path.join(__dirname, '..'), true, { NODE_ENV: 'development' }]);
}
const prettyCommand = command === 'i' ? 'installs' : command;
console.log(chalk.green('==============================================================================='));
spawnParallel(runAll, false, forTeamCity)
    .then(() =>
        console.log(
            '__________________________________________________________________\n',
            `Done with all ${prettyCommand}.\n`,
            chalk.green('===============================================================================')
        )
    )
    .catch(err => {
        console.log('__________________________________________________________________');
        console.error(`An error occur during ${prettyCommand}: `, err.message || err.toString());
        console.log(chalk.green('==============================================================================='));
        process.exit(1); // fail build.
    });
