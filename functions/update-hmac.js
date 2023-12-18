const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

const createMapKey = (key, path) => {
    return path.join('|') + '|' + key;
};

module.exports = function (file, options) {
    let configKey = null;
    let encryptedEntries = new Map();
    try {
        configKey = cryptUtils.retrieveKey();
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const cbDecrypt = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            // save encrypted value and decrypt entry
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                encryptedEntries.set(createMapKey(key, path), value);
                cbSetValue(cryptUtils.decrypt(value, configKey));
            }
        }
    };
    const cbRestoreEncryption = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            // restore entry if it was encrypted
            if (encryptedEntries.has(createMapKey(key, path))) {
                cbSetValue(encryptedEntries.get(createMapKey(key, path)));
            }
        }
    };
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    try {
        jt.traverse(config, cbDecrypt);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    if (options && options.hmacProp) {
        delete config[options.hmacProp];
        oh.createHmac(config, configKey, options.hmacProp);
    }
    else {
        delete config['__hmac'];
        oh.createHmac(config, configKey);
    }
    jt.traverse(config, cbRestoreEncryption);
    const result = JSON.stringify(config, null, 2);
    if (options && options.overwrite === true) {
        fs.writeFileSync(file, result);
    }
    else {
        console.log(result);
    }
};