const crypto = require('crypto');
const sc = require('@tsmx/string-crypto');

const prefix = 'ENCRYPTED|';

module.exports.retrieveKey = function (verbose = false) {
    const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
    let result = null;
    if (!process.env.CONFIG_ENCRYPTION_KEY) {
        throw new Error('Environment variable CONFIG_ENCRYPTION_KEY not set.');
    }
    else if (process.env.CONFIG_ENCRYPTION_KEY.toString().length == 32 || hexReg.test(process.env.CONFIG_ENCRYPTION_KEY.toString())) {
        result = process.env.CONFIG_ENCRYPTION_KEY.toString();
    }
    else {
        throw new Error('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
    }
    if (verbose) {
        console.log('CONFIG_ENCRYPTION_KEY found, using key: **************************' + result.slice(result.length - 6));
    }
    return result;
};

module.exports.encrypt = function (text, key) {
    return prefix + sc.encrypt(text, { key: key });
};

module.exports.decrypt = function (text, key) {
    let decrypted = null;
    try {
        decrypted = sc.decrypt(text.toString().substring(prefix.length), { key: key });
    }
    catch (error) {
        throw new Error('Decryption failed. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
            'Please see the docs under: https://github.com/tsmx/secure-config');
    }
    return decrypted.toString();
};

module.exports.genkey = function () {
    return crypto.randomBytes(32).toString('hex');

};