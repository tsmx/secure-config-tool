const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

module.exports.retrieveKey = function (verbose) {
    const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
    let result = null;
    if (!process.env.CONFIG_ENCRYPTION_KEY) {
        throw new Error('Environment variable CONFIG_ENCRYPTION_KEY not set.');
    }
    else if (process.env.CONFIG_ENCRYPTION_KEY.toString().length == 32) {
        result = Buffer.from(process.env.CONFIG_ENCRYPTION_KEY);
    }
    else if (hexReg.test(process.env.CONFIG_ENCRYPTION_KEY)) {
        result = Buffer.from(process.env.CONFIG_ENCRYPTION_KEY, 'hex');
    }
    else {
        throw new Error('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
    }
    if (verbose) {
        console.log('CONFIG_ENCRYPTION_KEY found, using key: **************************' + process.env.CONFIG_ENCRYPTION_KEY.toString().slice(26));
    }
    return result;
};

module.exports.encrypt = function (text, key) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return 'ENCRYPTED|' + iv.toString('hex') + '|' + encrypted.toString('hex');
};

module.exports.decrypt = function (text, key) {
    let decrypted = null;
    try {
        let input = text.split('|');
        input.shift();
        let iv = Buffer.from(input[0], 'hex');
        let encryptedText = Buffer.from(input[1], 'hex');
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    }
    catch (error) {
        throw new Error('Decryption failed. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
            'Please see the docs under: https://github.com/tsmx/secure-config');
    }
    return decrypted.toString();
};

module.exports.genkey = function (base64 = false) {
    let result = null;
    if (base64) {
        result = crypto.randomBytes(24).toString('base64');
    }
    else {
        result = crypto.randomBytes(32).toString('hex');
    }
    return result;
};