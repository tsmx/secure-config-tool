const crypt = require('../utils/crypt');

module.exports = function (options) {
    console.log(crypt.genkey(options && options.base64));
};