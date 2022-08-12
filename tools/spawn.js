const os = require('os');
const { spawn } = require('child_process');

const red = text => `\u001b[31;5;40m${text}\u001b[0m`;

/**
 * Spawns a child process for each array entry.
 * Waits for each to finish before starting the next.
 * Passes results (stdout and stderr from child process) to the
 * second parameter.
 * @param {object[]} spawnParams parameters you would pass into spawnOne
 * @param {function} [resultHandler] each serial result is passed into this function. If absent, results are piped to the current process' output
 */
function spawnSerially(spawnParams, failOnFirstError = true) {
    let spawnPromise = Promise.resolve();
    let errors = [];
    for (let i = 0; i < spawnParams.length; i++) {
        const task = spawnParams[i];
        spawnPromise = spawnPromise.then(result => {
            return spawnOne(...task);
        });
        if (!failOnFirstError) {
            spawnPromise = spawnPromise.catch(err => {
                errors.push(err);
            });
        }
    }
    return spawnPromise.then(() => errors);
}

function spawnOne(pathToExe, args, cwd = os.tmpdir(), useShell = false, envvars) {
    return new Promise((resolve, reject) => {
        if (pathToExe === 'echo') {
            args.forEach(log => {
                console.log(String.raw`${log}`);
            });
            resolve();
        } else {
            console.log(`Running ${pathToExe} in active directory ${cwd}. Arguments are: ${JSON.stringify(args)}.`);
            let restore;
            const env = { ...process.env, ...envvars };
            let options = { cwd, env, stdio: [process.stdin, process.stdout, process.stderr] };
            if (useShell) {
                options = { ...options, shell: true };
            }

            restore = spawn(pathToExe, args, options);

            restore.on('exit', function (code) {
                console.debug(`${pathToExe} child process exited with code ${code.toString()}`);
                if (code !== 0) {
                    reject(
                        `Failing executable was: ${pathToExe}. Active directory was ${cwd}. Failure arguments are: ${JSON.stringify(
                            args
                        )}.`
                    );
                } else {
                    resolve();
                }
            });
        }
    });
}

function spawnParallel(spawnParams, isTestSuite, forTeamCity = true) {
    console.log('One moment please as we execute everything in parallel in the background.');
    console.log("When all have completed, each process' logs will be printed below.");
    let errors = [];
    const processes = spawnParams.map(([name, ...task]) =>
        spawnSafe(...task).then(logs => {
            let output;
            if (forTeamCity) {
                output = [
                    String.raw`##teamcity[${isTestSuite ? 'testSuiteStarted' : 'blockOpened'} name='${name}']`,
                    ...logs.output,
                    String.raw`##teamcity[${isTestSuite ? 'testSuiteFinished' : 'blockClosed'} name='${name}']`
                ];
            } else {
                output = logs.output;
            }

            return { ...logs, output };
        })
    );
    return Promise.all(processes).then(processLogs => {
        //we have to do this afterwards, as otherwise it might mix logs from different processes.
        let index = 0;
        for (const log of processLogs) {
            for (const logline of log.output) {
                console.log(String.raw`${logline}`);
            }
            if (log.hasError) {
                // const [name, pathToExe, args, cwd = os.tmpdir()] = spawnParams[index];
                console.error(`${JSON.stringify(spawnParams[index])} failed.`);
            }
            index++;
        }
        if (processLogs.some(output => output.hasError)) {
            const failingTasks = processLogs
                .filter(output => output.hasError)
                .map(output => `${output.cwd} - ${red(`failure: ${output.code}`)}`);
            throw new Error(`The following parallel tasks failed:\n\t - ${failingTasks.join('\n\t')}`);
        }
    });
}

function spawnSafe(pathToExe, args, cwd = os.tmpdir(), useShell = false, envVars) {
    return new Promise(resolve => {
        let result = [];
        let hasError = false;
        function log(data) {
            result.push(String.raw`${data}`);
        }
        log('__________________________________________________________________');

        // This info is useful and can be uncommented for debugging:
        // log(`Running ${pathToExe} in active directory ${cwd}. Arguments are: ${JSON.stringify(args)}.`);

        let restore;
        const env = { ...process.env, ...envVars };
        let options = { cwd, env };
        if (useShell) {
            options = { ...options, shell: true };
        }
        try {
            restore = spawn(pathToExe, args, options);
        } catch (error) {
            console.error(
                `${pathToExe} in active directory ${cwd} with arguments: ${JSON.stringify(args)} failed: ${
                    error.message
                }`
            );
        }
        restore.stdout.on('data', function (data) {
            log(data.toString());
        });

        restore.stderr.on('data', function (data) {
            log(data.toString());
        });

        restore.on('exit', function (code) {
            log(`${pathToExe} child process exited with code ${code.toString()}`);
            if (code !== 0) {
                hasError = true;
            }
            resolve({ output: result, hasError, cwd, code });
        });
    });
}

module.exports = {
    spawn: spawnOne,
    spawnSerially,
    spawnParallel
};
