#!/usr/bin/env node

var program = require('commander');
const createSecret = require('./functions/create-secret');
const createKey = require('./functions/create-key');
const decryptSecret = require('./functions/decrypt-secret');

program
    .command('create')
    .description('creates an encrypted entry for secure-config')
    .option('-s, --secret <secret>', 'the secret value to be encrypted, asked if not provided')
    .option('-v, --verbose', 'verbose output')
    .action(createSecret).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool create');
        console.log('  $ secure-config-tool create --secret MySecretPassword');
    });

program
    .command('genkey')
    .description('generates a 32 byte AES key for encrypting/decrypting values for secure-config and returns the hex string')
    .action(createKey).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool genkey');
    });

program
    .command('decrypt <secret>')
    .description('decrypts an encrypted entry for secure-config')
    .option('-v, --verbose', 'verbose output')
    .action(decryptSecret).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"');
        console.log('  $ secure-config-tool decrypt --verbose "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"');
    });

program.parse(process.argv);