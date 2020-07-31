const crypt = require('../utils/crypt');

module.exports = function (options) {
    const key = crypt.genkey();
    console.log(key);
};