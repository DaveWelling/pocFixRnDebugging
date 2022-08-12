
'use strict';

const os = require('os');
const ifaces = os.networkInterfaces();
module.exports = {
    getAllInterfaceNames,
    getIpForDefaultInterface,
    getAllIps,
    getIpForInterface,
    getPreferredIp
};

function getPreferredIp() {
    if (process.env.DEFAULT_HOST_INTERFACE) {
        return getIpForDefaultInterface(process.env.DEFAULT_HOST_INTERFACE);
    } else {
        if (process.env.DOCKER_HOST_IP_ADDRESS) {
            let ipsAvailable = getAllIps();
            if (!ipsAvailable.includes(process.env.DOCKER_HOST_IP_ADDRESS)){
                throw new Error(`You have not set an DEFAULT_HOST_INTERFACE
and your DOCKER_HOST_IP_ADDRESS environment variable (${process.env.DOCKER_HOST_IP_ADDRESS}) is not
one of your current IP addresses (${getAllIps().join()}).
options for setting DEFAULT_HOST_INTERFACE include: ${getAllInterfaceNames().join()} `);
            }
            return process.env.DOCKER_HOST_IP_ADDRESS;
        } else {
            throw new Error(`You have set neither a DOCKER_HOST_IP_ADDRESS
or a DEFAULT_HOST_INTERFACE environment variable. Try
setting DEFAULT_HOST_INTERFACE to one of these: ${getAllInterfaceNames().join()} `);
        }
    }
}

function getIpForDefaultInterface(){

    if (!process.env.DEFAULT_HOST_INTERFACE) {
        throw new Error(`Create an environment variable DEFAULT_HOST_INTERFACE.
Options for the value include: ${getAllInterfaceNames().join()}`);
    } else {
        return getIpForInterface(process.env.DEFAULT_HOST_INTERFACE);
    }
}

function getIpForInterface(interfaceName){
    let selectedIp;
    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                if (interfaceName === (ifname + ':' + alias)) {
                    selectedIp = iface.address;
                }
            } else {
                // this interface has only one ipv4 adress
                if (interfaceName === ifname) {
                    selectedIp = iface.address;
                }
            }
            ++alias;
        });
    });
    if (selectedIp) return selectedIp;
    throw new Error(`Interface ${interfaceName} not found.`);
}
function getAllInterfaceNames() {
    const ips = [];
    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                ips.push(ifname + ':' + alias);
            } else {
                // this interface has only one ipv4 adress
                ips.push(ifname);
            }
            ++alias;
        });
    });
    return ips;
}

function getAllIps() {
    const ips = [];
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            ips.push(iface.address);
        });
    });
    return ips;
}