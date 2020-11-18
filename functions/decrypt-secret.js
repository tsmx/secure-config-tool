const crypt = require('../utils/crypt');

module.exports = function (secret, options) {
    const verbose = options && options.verbose;
    let key = null;
    let decrypted = null;
    try {
        key = crypt.retrieveKey(verbose);
        decrypted = crypt.decrypt(secret, key);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    console.log(decrypted);
};