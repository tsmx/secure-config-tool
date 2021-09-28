const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

function logTestResults(decryptionResult, hmacResult) {
    console.log('Decryption: ' + decryptionResult);
    console.log('HMAC:       ' + hmacResult);
}

module.exports = function (file, options) {
    let decryptionResult = 'FAILED';;
    let hmacResult = 'not tested';
    let configKey = null;
    try {
        configKey = cryptUtils.retrieveKey();
    }
    catch (error) {
        console.log(error.message);
        logTestResults(decryptionResult, hmacResult);
        process.exit(-1);
    }
    let config = null;
    try {
        const data = fs.readFileSync(file);
        config = JSON.parse(data);
    }
    catch (error) {
        console.log(error.message);
        logTestResults(decryptionResult, hmacResult);
        process.exit(-1);
    }
    if (options && options.verbose) {
        console.log('Raw configuration data:')
        console.log(JSON.stringify(config, null, 2));
    }
    const callbacks = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                cbSetValue(cryptUtils.decrypt(value, configKey));
            }
        }
    };
    try {
        jt.traverse(config, callbacks, true);
    }
    catch (error) {
        console.log(error.message);
        logTestResults(decryptionResult, hmacResult);
        process.exit(-1);
    }
    decryptionResult = 'PASSED';
    if (options && options.verbose) {
        console.log('Decrypted configuration data:')
        console.log(JSON.stringify(config, null, 2));
    }
    if (!options || (options && !options.skipHmac)) {
        if (options && options.hmacProp) {
            hmacResult = oh.verifyHmac(config, configKey, options.hmacProp) ? 'PASSED' : 'FAILED';
        }
        else {
            hmacResult = oh.verifyHmac(config, configKey) ? 'PASSED' : 'FAILED';
        }
        if (hmacResult === 'FAILED') {
            logTestResults(decryptionResult, hmacResult);
            process.exit(-1);
        }
    }
    logTestResults(decryptionResult, hmacResult);
};