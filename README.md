# [**secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Generating encrypted secrets for [secure-config](https://github.com/tsmx/secure-config). Also check out the NPM package [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

## Usage

```
[tsmx@localhost secure-config-tool]$ export CONFIG_ENCRYPTION_KEY=1234567890qwertzuiopasdfghjklyxc
[tsmx@localhost secure-config-tool]$ node secure-config-tool.js 
CONFIG_ENCRYPTION_KEY found, using key: **************************jklyxc
Please enter secret: test

Encrypted secret - copy & paste this line into your config file:
ENCRYPTED|5d3e2be52d6fdf818c00a864c2dfc1d0|75727dcb553eecd358de85f03bda33d7

Plaintext for verification:
test
Success.
```

The key length must be 32 bytes!