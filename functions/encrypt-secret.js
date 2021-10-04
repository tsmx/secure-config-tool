const cryptUtils = require('../utils/crypt');

module.exports = function (secret, options) {
    const verbose = options && options.verbose;
    let key = null;
    try {
        key = cryptUtils.retrieveKey(verbose);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const encrypted = cryptUtils.encrypt(secret, key);
    console.log(encrypted);
    if (verbose) {
        console.log('Plaintext for verification:');
        const check = cryptUtils.decrypt(encrypted, key);
        console.log(check);
        console.log('Success.');
    }
};