# [**secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Generating encrypted secrets for [secure-config](https://github.com/tsmx/secure-config). Also check out the NPM packages [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config) and [@tsmx/secure-config-tool](https://www.npmjs.com/package/@tsmx/secure-config-tool).

## Usage

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=YOUR_SECRET_KEY_1234567890qwertz
[tsmx@localhost ]$ secure-config-tool create --secret MySecret
ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f
```

The key length must be 32 bytes!

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.