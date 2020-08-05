const crypt = require('../utils/crypt');

module.exports = function (_options) {
    const key = crypt.genkey();
    console.log(key);
};