const cryptUtils = require('../utils/crypt');

module.exports = function () {
    console.log(cryptUtils.genkey());
};