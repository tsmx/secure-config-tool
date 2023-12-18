const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

const defaultSecretPatterns = ['user', 'pass', 'token'];

function patternMatch(value, patterns) {
    return patterns.some((pattern) => {
        let regEx = new RegExp(pattern, 'i');
        return regEx.test(value);
    });
}

module.exports = function (file, options) {
    let configKey = null;
    try {
        configKey = cryptUtils.retrieveKey();
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    let patternArray = defaultSecretPatterns;
    if (options && options.patterns) {
        patternArray = options.patterns.split(',');
        patternArray = patternArray.map(item => item.trim());
    }
    const callbacks = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (typeof value !== 'object' && patternMatch(key, patternArray)) {
                cbSetValue(cryptUtils.encrypt(value, configKey.toString()));
            }
        }
    };
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    if (!options || (options && options.hmac !== false)) {
        if (options && options.hmacProp) {
            oh.createHmac(config, configKey, options.hmacProp);
        }
        else {
            oh.createHmac(config, configKey);
        }
    }
    if (!options || (options && options.encryption !== false)) {
        jt.traverse(config, callbacks);
    }
    console.log(JSON.stringify(config, null, 2));
};