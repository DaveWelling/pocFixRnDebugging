const readline = require('readline');

const isWindows = process.platform === 'win32';

const green = text => `\u001b[38;5;40m${text}\u001b[0m`;
const bold = text => `\u001b[1m${text}\u001b[0m`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const [, , command] = process.argv;
if (command !== '-help') {
    basicInstructions();
    process.exit(0);
} else {
    console.clear();
    mainMenu();
}

function basicInstructions() {
    const instructions = [
        'Please perform one of the following:',
        'To start the web server:',
        green('npm i --legacy-peer-deps'),
        green('cd silo_ui-web'),
        green('npm run serve'),
        '',
        'Or to start debugging android, open 2 (or 3) command prompts',
        'Prompt 1:',
        green('cd silo_ui-native'),
        green('npm run serve'),
        'Prompt 2:',
        green('cd silo_ui-native'),
        green('npm i --legacy-peer-deps'),
        green('npm run android'),
        '',
        green('adb shell input keyevent KEYCODE_MENU'),
        'OPTIONAL: Prompt 3:',
        green('adb logcat -c'),
        green('adb logcat *:E'),
        green('adb logcat *:S silouinative-RFID:* silouinative:*'),
        'Or more inclusive:',
        green(
            'adb logcat BatteryService:S WifiHAL:S HWComposer:S chatty:S PowerManagerService:S System.out:S CompatibilityInfo:S KeyguardUpdateMonitor:S ApplicationUsage:S ZEBRA_LIC:S WifiStateMachine:S zygote64:S QtiCarrierConfigHelper:S dd_service:S WifiService:S audio_hw_primary:S ACDB-LOADER:S msm8916_platform:S soundtrigger:S Finsky:S dex2oat:S SoLoader:S unknown:S AudioPolicyManagerCustom:S audio_hw_extn:S hardware_info:S audio_hw_utils:S'
        ),
        ''
    ];

    instructions.forEach(x => console.log(x));
}

function mainMenu() {
    const lines = [
        { text: 'Web', print: webHelp },
        { text: 'Android', print: AndroidHelp }
    ];

    printMenu(lines, 'What would you like help with?');
}

function AndroidHelp() {
    const lines = [
        { text: 'Start Android Debugging Server', print: androidServer },
        { text: 'Connect a device over Wifi', print: androidWifi },
        { text: 'Build & deploy RN app to device', print: runAndroid },
        { text: 'Inspect Native Logs', print: nativeLogs },
        { text: 'Return to Main Menu', print: mainMenu }
    ];

    printMenu(lines, 'What would you like help with?');
}
function androidServer() {
    const instructions = ['To Start Android Debugging Server:', green('cd silo_ui-native'), green('npm run serve'), ''];

    instructions.forEach(x => console.log(x));

    AndroidHelp();
}

function androidWifi() {
    let osSpecific;
    if (isWindows) {
        osSpecific = [
            green('adb shell ip -f inet addr show'),
            'Or from powerShell',
            green('adb shell ip -f inet addr show | Select-String "inet"')
        ];
    } else {
        osSpecific = [green('adb shell ip -f inet addr show| grep "inet"')];
    }
    const instructions = [
        'To connect a device over Wifi:',
        'When connected over USB',
        green('adb tcpip 5555'),
        ...osSpecific,
        'Start debugging the app over USB.',
        'Run ' + green('adb shell input keyevent KEYCODE_MENU') + ' to open Debugging menu',
        ' - On the device, select "Settings"',
        ' - Under "Debugging", select "Debug Server host an & port for device"',
        ' - add ' + bold('<the IP address of your development machine>:8081') + ' and click "OK"',
        "Get the device's IP from the ifConfig command above",
        'Tell adb to connect to that IP. E.g.:',
        green('adb connect 192.168.86.55')
    ];

    instructions.forEach(x => console.log(x));

    AndroidHelp();
}
function runAndroid() {
    const instructions = [
        'Build & deploy RN app to device:',
        green('cd silo_ui-native'),
        green('npm i --legacy-peer-deps'),
        green('npm run android'),
        ''
    ];

    instructions.forEach(x => console.log(x));

    AndroidHelp();
}

function nativeLogs() {
    const instructions = [
        'To reset native logs:',
        green('adb logcat -c'),
        'To see te logs for JUST the Java code:',
        green('adb logcat *:S silouinative-RFID:*'),
        'To see all Errors, all the Java code logs, and all Info and above logs from JavaScript:',
        green('adb logcat *:E silouinative-RFID:* silouinative:I HWComposer:S native:S ActivityManager:S'),
        ''
    ];

    instructions.forEach(x => console.log(x));

    AndroidHelp();
}

function webHelp() {
    const instructions = ['To start the web server:', green('npm i'), green('cd silo_ui-web'), green('npm run serve')];

    instructions.forEach(x => console.log(x));

    mainMenu();
}

function printMenu(lines, title = 'OPTIONS') {
    console.log('===================================================');
    console.log('\n' + bold(title));
    lines.forEach((x, i) => console.log(`${String(i + 1).padStart(3, ' ')}:  ${x.text}`));

    console.log('\n  x:  Exit');
    rl.question('Please enter your choice from above? ', function (option) {
        if (option.toLowerCase() === 'x') {
            process.exit(0);
        } else if (lines[option - 1]) {
            console.clear();
            lines[option - 1].print();
        } else {
            printMenu(lines, title);
        }
    });
}
