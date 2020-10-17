const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const sc = require('@tsmx/string-crypto');
const crypt = require('../utils/crypt');

const defaultSecretPatterns = ['user', 'pass', 'token'];

function patternMatch(value, patterns) {
    result = false;
    patterns.forEach((pattern) => {
        let regEx = new RegExp(pattern, 'i');
        if(regEx.test(value)) {
            result = true;
        }
    });
    return result;
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
    if(options && options.patterns) {
        patternArray = options.patterns.split(',');
        patternArray = patternArray.map(item => item.trim());
    }
    console.log(patternArray);
    const callbacks = {
        processValue: (propKey, propValue, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (patternMatch(propKey, patternArray)) {
                cbSetValue(sc.encrypt(propValue, { key: key.toString() }));
            }
        }
    }
    let configFile = fs.readFileSync(file);
    let config = JSON.parse(configFile);
    jt.traverse(config, callbacks, true);
    console.log(JSON.stringify(config, null, 4));
};