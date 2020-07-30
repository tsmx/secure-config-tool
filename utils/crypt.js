const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

module.exports.retrieveKey = function (verbose) {
    if (!process.env.CONFIG_ENCRYPTION_KEY) {
        console.log('Environment variable CONFIG_ENCRYPTION_KEY not set.');
        process.exit(-1);
    }
    else if (process.env.CONFIG_ENCRYPTION_KEY.toString().length !== 32) {
        console.log('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
        process.exit(-1);
    }
    if (verbose) {
        console.log('CONFIG_ENCRYPTION_KEY found, using key: **************************' + process.env.CONFIG_ENCRYPTION_KEY.toString().slice(26));
    }
    return Buffer.from(process.env.CONFIG_ENCRYPTION_KEY);
}

module.exports.encrypt = function (text, key) {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return 'ENCRYPTED|' + iv.toString('hex') + '|' + encrypted.toString('hex');
}

module.exports.decrypt = function (text, key) {
    let input = text.split('|');
    input.shift();
    let iv = Buffer.from(input[0], 'hex');
    let encryptedText = Buffer.from(input[1], 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}