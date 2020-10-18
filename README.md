# [**@tsmx/secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/secure-config-tool)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/secure-config-tool)
[![Build Status](https://travis-ci.com/tsmx/secure-config-tool.svg?branch=master)](https://travis-ci.org/tsmx/secure-config-tool)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/secure-config-tool/badge.svg?branch=master)](https://coveralls.io/github/tsmx/secure-config-tool?branch=master)

> Supporting command-line tool for [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

Features:
- generating keys
- encrypting values in existing configuration files 
- encrypting single secrets
- decrypting single secrets (for validation/testing purposes)

## Installation

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
```

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.

## Key generation

```
[tsmx@localhost ]$ secure-config-tool genkey
9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
```

## Encrypt files

Reads an existing JSON configuration file and encrypts the values according to specified key-patterns. The result is printed to stdout, so use `>` to save it in a new file.

### Using standard encryption patterns

```
[tsmx@localhost ]$ secure-config-tool create-file ./config.json > config-production.json
```

If no patterns are specified using the `-p` / `--patterns` option, the standard patterns are used: `'user', 'pass', 'token'`. For each pattern a case-insensitive match is tested for each key of the JSON file to be encrypted. If the match succeeds, the value of the key is encrypted.

### Using custom encryption patterns

```
[tsmx@localhost ]$ secure-config-tool create-file -p "Username,Password" ./config.json > config-production.json
```

Same as above, but your custom patterns are used. In the example every key is tested case-insensitive against the two regex expressions `/Username/` and `/Password/`.

## Encrypt values

```
[tsmx@localhost ]$ secure-config-tool create --secret MySecret
ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f
```

Encrypts a single value string for copy & paste to a JSON configuration file.

## Decrypt values

```
[tsmx@localhost ]$ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
MySecret
```

Decrypts a single vaule string for testing purposes.

## Test

```
npm install
npm test
```