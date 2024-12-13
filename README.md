# [**@tsmx/secure-config-tool**](https://github.com/tsmx/secure-config-tool)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![npm (scoped)](https://img.shields.io/npm/v/@tsmx/secure-config-tool)
![node-current (scoped)](https://img.shields.io/node/v/@tsmx/secure-config-tool)
[![Build Status](https://img.shields.io/github/actions/workflow/status/tsmx/secure-config-tool/git-build.yml?branch=master)](https://img.shields.io/github/actions/workflow/status/tsmx/secure-config-tool/git-build.yml?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/tsmx/secure-config-tool/badge.svg?branch=master)](https://coveralls.io/github/tsmx/secure-config-tool?branch=master)

> Supporting command-line tool for [@tsmx/secure-config](https://www.npmjs.com/package/@tsmx/secure-config).

Features:
- **create secure configurations** with encrypted secrets and a HMAC out of existing JSON files
- **key rotation** of an existing secure configuration
- **update HMAC** values of existing secure configuration files after they have changed
- **test** existing secure configuration JSON files (HMAC validation & decryption)
- **generate keys** 
- **encrypt single secrets** for copy & paste into existing configurations
- **decrypt single secrets** for testing purposes

To get more information please also check out the [secure-config documentation](https://tsmx.net/secure-config/).

## Basic usage

![Usage GIF](https://tsmx.net/wp-content/uploads/2021/08/secure-config-tool-2-usage.gif)

## Installation

```
[tsmx@localhost ]$ npm i -g @tsmx/secure-config-tool
```

For better convenience the installation as a global package is recommended. Though local installation and use is also possible.

## Arguments

### create

Read an existing JSON configuration file and encrypt the values according to specified key-patterns. Also adds a HMAC property to the JSON configuration for enabling validation against illegal tampering.

The result is printed to stdout. Use `>` to save it in a new file.

The key used to create the secure configuration has to be set as environment variable `CONFIG_ENCRYPTION_KEY`. See [genkey option](#genkey) on how to create and export a secure key.

```
[tsmx@localhost ]$ secure-config-tool create config.json > config-production.json
```

#### -p, --patterns

A comma-separated list of patterns for the keys of the configuration file that should be encrypted. Pattern matching is done for every key of the provided JSON input with a case-insensitive RegEx validation. If the match succeeds, the value of the key is encrypted.

```
[tsmx@localhost ]$ secure-config-tool create -p "Username,Password" config.json > config-production.json
```

In the example stated above every key is tested case-insensitive against the two regex expressions `/Username/` and `/Password/`.

If no patterns are explicitly specified by using this option, the standard patterns are used: `'user', 'pass', 'token'`. 

#### -ne, --no-encrpytion

Do not encrypt any value of the input file. Helpful if you want to use only the HMAC feature withput any encryption.

#### -nh, --no-hmac

Do not create and add the configurations HMAC to the output. Helpful if you only want to use encryption without HMAC.

#### -hp, --hmac-prop

Specify a property name to store the generated HMAC value in. Defaults to `__hmac` if the option is not present. Doesn't have any effect if `-nh` is specified at the same time.

### rotate-key

Rotates the key of an existing secure configuration file. Environment variables `CONFIG_ENCRYPTION_KEY` and `CONFIG_ENCRYPTION_KEY_NEW` must be set:
- `CONFIG_ENCRYPTION_KEY`: the key for the existing secure configuration file
- `CONFIG_ENCRYPTION_KEY_NEW`: the ney key to rotate to (Hint: you can use the [genkey option](#genkey) to generate a new one)

Basic console example:

```
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=...
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY_NEW=...
[tsmx@localhost ]$ secure-config-tool rotate-key config-production.json
```

The result is printed to stdout. Use `>` to save it in a new file or the `--overwrite` option. 

If the source secure configuration file includes a HMAC in the default `__hmac` property it will be updated automatically useing the new key. If the source file has a HMAc in a custom named property, use the `-hp` option to provide the property name.

#### -hp, --hmac-prop

Use this option to specify the property name of an existing HMAC value to be updated in the source secure configuration file if it is deviating from the default `__hmac`.

#### -o, --overwrite

Overwrite the original configuration file after rotating the key instead of writing to stdout.

### update-hmac

Updates the HMAC of an existing secure configuration file after it has been changed (properties added/deleted/changed...).

The result is printed to stdout. Use `>` to save it in a new file or the `--overwrite` option.

The key used to update the HMAC has to be set as environment variable `CONFIG_ENCRYPTION_KEY`. Make sure to use the right key which was used to create the already existing secure-config file.

```
[tsmx@localhost ]$ secure-config-tool update-hmac -o config-production.json
```

#### -o, --overwrite

Overwrite the original configuration file with the updated HMAC instead of writing to stdout.

#### -hp, --hmac-prop

Use this option to specify the property name of the HMAC value to be updated if it is deviating from the default `__hmac`.

### test

Test decryption and HMAC validation of an existing secure-configuration file. The key to test against has to be set as environment variable `CONFIG_ENCRYPTION_KEY`.

```
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=9af7...
[tsmx@localhost ]$ secure-config-tool test config-production.json 
Decryption: PASSED
HMAC:       PASSED
```

#### -hp, --hmac-prop

Specify the property name og the HMAC value to validate against. Defaults to `__hmac` if the option is not present. Doesn't have any effect if `-sh` is specified at the same time.

#### -sh, --skip-hmac

Skip the HMAC validation test.

#### -v, --verbose

Print out the the raw input data and the decrypted data. 

### genkey

Generate a cryptographic 32 byte key to be used for AES encryption/decryption as well as HMAC validation of your configuration. 

```
[tsmx@localhost ]$ secure-config-tool genkey
9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
[tsmx@localhost ]$ export CONFIG_ENCRYPTION_KEY=9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f
```

### encrypt

Encrypt a single value string for copy & paste to a JSON configuration file.

```
[tsmx@localhost ]$ secure-config-tool encrypt "MySecret"
ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f
```

### decrypt

Decrypt a single value string for testing purposes.

```
[tsmx@localhost ]$ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
MySecret
```

## Changelog

### 2.2.0
- Support for encrypted properties of objects in arrays added, e.g. `{  configArray: [ { key: 'ENCRYPTED|...' }, { key: 'ENCRYPTED|... ' } ] }`

### 2.3.0
- [Key rotation](#rotate-key) feature added

## Test

```
npm install
npm test
```