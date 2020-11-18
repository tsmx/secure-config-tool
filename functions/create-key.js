const crypt = require('../utils/crypt');

module.exports = function () {
  console.log(crypt.genkey());
};