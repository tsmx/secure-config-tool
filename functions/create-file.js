const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const crypt = require('../utils/crypt');

const defaultSecretPatterns = ['user', 'pass', 'token'];

function patternMatch(value, patterns) {
    return patterns.some((pattern) => {
        let regEx = new RegExp(pattern, 'i');
        return regEx.test(value);
    });
}

module.exports = function (file, options) {
    let key = null;
    try {
        key = crypt.retrieveKey();
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
        processValue: (propKey, propValue, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (patternMatch(propKey, patternArray)) {
                cbSetValue(crypt.encrypt(propValue, key.toString()));
            }
        }
    };
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    if (!options || (options && options.nohmac !== true)) {
        if (options && options.hmacprop) {
            oh.createHmac(config, key, options.hmacprop);
        }
        else {
            oh.createHmac(config, key);
        }
    }
    if (!options || (options && options.noencryption !== true)) {
        jt.traverse(config, callbacks, true);
    }
    console.log(JSON.stringify(config, null, 2));
};