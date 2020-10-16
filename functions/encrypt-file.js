const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const sc = require('@tsmx/string-crypto');
const crypt = require('../utils/crypt');

module.exports = function (file) {
    let key = null;
    try {
        key = crypt.retrieveKey();
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const callbacks = {
        processValue: (propKey, propValue, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (propKey == 'username' || propKey == 'password') {
                cbSetValue(sc.encrypt(propValue, { key: key.toString() }));
            }
        }
    }
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    jt.traverse(config, callbacks, true);
    console.log(JSON.stringify(config, null, 4));
};