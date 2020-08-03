const crypt = require('../utils/crypt');

module.exports = function (secret, options) {
    const verbose = options && options.verbose;
    var key = null;
    try {
        key = crypt.retrieveKey(verbose);
    }
    catch (error) {
        console.log(error.message);
        process.exit(-1);
    }
    const decrypted = crypt.decrypt(secret, key);
    console.log(decrypted);
};