const cryptUtils = require('../utils/crypt');

module.exports = function (secret, options) {
    const verbose = options && options.verbose;
    let key = null;
    let decrypted = null;
    try {
        key = cryptUtils.retrieveKey(cryptUtils.CONFIG_ENCRYPTION_KEY, verbose);
        decrypted = cryptUtils.decrypt(secret, key);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    console.log(decrypted);
};