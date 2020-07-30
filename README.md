# [**secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Generating encrypted secrets for [secure-config](https://github.com/tsmx/secure-config). Also check out the NPM packages [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config) and [@tsmx/secure-config-tool](https://www.npmjs.com/package/@tsmx/secure-config-tool).

## Usage

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=YOUR_SECRET_KEY_1234567890qwertz
[tsmx@localhost ]$ secure-config-tool create --secret MySecretPassword
ENCRYPTED|a8aed22ea73cadc0f2c045e5e9d96f09|cb086fb46834dcde68b8979cfe637a4158ce846957fbb4d4a7cac5a92c21ce6a
```

The key length must be 32 bytes!

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.