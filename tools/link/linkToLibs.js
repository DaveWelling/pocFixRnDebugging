const createSymlink = require('create-symlink');
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink);
const path = require('path');
let rimRaf = require('rimraf');
rimRaf = util.promisify(rimRaf);
const basePath = path.join(__dirname, '..', '..');

module.exports = function linkLib(links) {
    const promises = links.map(link => {
        const source = path.resolve(link[0]);
        const dest = path.join(basePath, link[1]);
        const linkPath = path.resolve(dest);
        // Link path exists
        if (fs.existsSync(linkPath)) {
            let lstat = fs.lstatSync(linkPath);
            // Check for hard (not symbolic link) paths and delete them
            if (!lstat.isSymbolicLink()) {
                return rimRaf(linkPath).then(() => createSymlink(source, linkPath, { type: 'dir' }));
            } else if (fs.readlinkSync(linkPath) !== source) {
                // if the link target is wrong, recreate the link
                return unlink(linkPath).then(() => createSymlink(source, linkPath, { type: 'dir' }));
            }
        } else {
            return createSymlink(source, linkPath, { type: 'dir' });
        }
    });

    Promise.all(promises)
        .then(() => {
            console.log('Done');
        })
        .catch(err => console.error(err.stack ? err.stack : err.message));
};
