# [**secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/secure-config-tool)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/secure-config-tool)
[![Build Status](https://travis-ci.com/tsmx/secure-config-tool.svg?branch=master)](https://travis-ci.org/tsmx/secure-config-tool)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/secure-config-tool/badge.svg?branch=master)](https://coveralls.io/github/tsmx/secure-config-tool?branch=master)

> Supporting command-line tool for [secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

Features:
- generating keys
- encrypting secrets
- decrypting secrets (for validation/testing purposes)

## Usage

### Installation

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
```

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.

### Key generation

```
[tsmx@localhost ]$ secure-config-tool genkey
9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
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