const crypto = require('crypto');
const sc = require('@tsmx/string-crypto');

const prefix = 'ENCRYPTED|';
const encryptionKey  = 'CONFIG_ENCRYPTION_KEY';

const decryptErrorMessage = `Decryption failed. Please check that the right key is used and the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"
See the docs under: https://github.com/tsmx/secure-config`;

module.exports.ENCRYPTION_PREFIX = prefix;
module.exports.DECRYPTION_ERROR = decryptErrorMessage;
module.exports.CONFIG_ENCRYPTION_KEY = encryptionKey;

module.exports.retrieveKey = function (keyName, verbose = false) {
    const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
    let result = null;
    if (!process.env[keyName]) {
        throw new Error(`Environment variable ${keyName} not set.`);
    }
    else if (process.env[keyName].toString().length == 32 || hexReg.test(process.env[keyName].toString())) {
        result = process.env[keyName].toString();
    }
    else {
        throw new Error(`${keyName} length must be 32 bytes.`);
    }
    if (verbose) {
        console.log(`${keyName} found, using key: **************************` + result.slice(result.length - 6));
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
    catch (_error) {
        throw new Error(decryptErrorMessage);
    }
    return decrypted.toString();
};

module.exports.genkey = function () {
    return crypto.randomBytes(32).toString('hex');

};