const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

const createMapKey = (key, path) => {
    return path.join('|') + '|' + key;
};

module.exports = function (file, options) {
    let configKeyOld = null;
    let configKeyNew = null;
    let secretEntries = new Map();
    try {
        configKeyOld = cryptUtils.retrieveKey(cryptUtils.CONFIG_ENCRYPTION_KEY);
        configKeyNew = cryptUtils.retrieveKey(cryptUtils.CONFIG_ENCRYPTION_KEY_NEW);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const cbDecryptWithOldKey = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            // decrypt entry with old key and save the value & path
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                const decryptedSecret = cryptUtils.decrypt(value, configKeyOld);
                secretEntries.set(createMapKey(key, path), decryptedSecret);
                cbSetValue(decryptedSecret);
            }
        }
    };
    const cbEncryptwithNewKey = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            // encrypt entry with new key if it was encrypted with old key before
            if (secretEntries.has(createMapKey(key, path))) {
                cbSetValue(cryptUtils.encrypt(secretEntries.get(createMapKey(key, path)), configKeyNew));
            }
        }
    };
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    try {
        jt.traverse(config, cbDecryptWithOldKey);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    if (options && options.hmacProp) {
        delete config[options.hmacProp];
        oh.createHmac(config, configKeyNew, options.hmacProp);
    }
    else {
        if(config['__hmac']) {
            delete config['__hmac'];
            oh.createHmac(config, configKeyNew);
        }
    }
    jt.traverse(config, cbEncryptwithNewKey);
    const result = JSON.stringify(config, null, 2);
    if (options && options.overwrite === true) {
        fs.writeFileSync(file, result);
    }
    else {
        console.log(result);
    }
};