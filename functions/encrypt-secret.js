const crypt = require('../utils/crypt');

module.exports = function (secret, options) {
    const verbose = options && options.verbose;
    let key = null;
    try {
        key = crypt.retrieveKey(verbose);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const encrypted = crypt.encrypt(secret, key);
    console.log(encrypted);
    if (verbose) {
        console.log('Plaintext for verification:');
        const check = crypt.decrypt(encrypted, key);
        console.log(check);
        if (check === secret) {
            console.log('Success.');
        }
        else {
            console.log('Something went wrong...');
        }
    }
};