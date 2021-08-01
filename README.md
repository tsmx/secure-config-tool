# [**@tsmx/secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/secure-config-tool)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/secure-config-tool)
[![Build Status](https://img.shields.io/github/workflow/status/tsmx/secure-config-tool/git-ci-build)](https://img.shields.io/github/workflow/status/tsmx/secure-config-tool/git-ci-build)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/secure-config-tool/badge.svg?branch=master)](https://coveralls.io/github/tsmx/secure-config-tool?branch=master)

> Supporting command-line tool for [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

Features:
- create secure configurations with encrypted secrets and a HMAC for validation out of existing JSON files
- test secure configuration JSON files (HMAC validation & decryption)
- generate keys 
- encrypt single secrets for copy & paste into existing configurations
- decrypt single secrets for testing purposes

## Basic usage

![Usage GIF](https://tsmx.net/wp-content/uploads/2020/11/secure-config-tool-fast.gif)

## Installation

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
```

For better convenience I recommend the installation as a global package. Though local installation and use is also possible.

## Arguments

### `create`

Reads an existing JSON configuration file and encrypts the values according to specified key-patterns. Also adds a HMAC property to the JSON configuration for enabling validation against illegal tampering.

The result is printed to stdout, so use `>` to save it in a new file.

#### Using standard encryption patterns

```
[tsmx@localhost ]$ secure-config-tool create-file ./config.json > config-production.json
```

If no patterns are specified using the `-p` / `--patterns` option, the standard patterns are used: `'user', 'pass', 'token'`. For each pattern a case-insensitive match is tested for each key of the JSON file to be encrypted. If the match succeeds, the value of the key is encrypted.

#### Using custom encryption patterns

```
[tsmx@localhost ]$ secure-config-tool create-file -p "Username,Password" ./config.json > config-production.json
```

Same as above, but your custom patterns are used. In the example every key is tested case-insensitive against the two regex expressions `/Username/` and `/Password/`.

### `genkey`

Generates a cryptographic 32 byte key to be used for AES encryption/decryption as well as HMAC validation of your configuration. 

```
[tsmx@localhost ]$ secure-config-tool genkey
9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
```

### `encrypt`

Encrypts a single value string for copy & paste to a JSON configuration file.

```
[tsmx@localhost ]$ secure-config-tool encrypt "MySecret"
ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f
```

### `decrypt`

Decrypts a single value string for testing purposes.

```
[tsmx@localhost ]$ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
MySecret
```

## Test

```
npm install
npm test
```