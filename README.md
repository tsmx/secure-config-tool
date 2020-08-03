# [**secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Generating encrypted secrets, keys and decrypting values for [secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

## Usage

### Installation

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
```

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.

### Key generation

```
[tsmx@localhost ]$ secure-config-tool genkey
iC771qNLe+OGVcduw8fqpDIIK7lK0T5p
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=iC771qNLe+OGVcduw8fqpDIIK7lK0T5p
```

### Encrypt values

```
[tsmx@localhost ]$ secure-config-tool create --secret MySecret
ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f
```

### Decrypt values

```
[tsmx@localhost ]$ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
MySecret
```

## Test

```
npm install
npm test
```