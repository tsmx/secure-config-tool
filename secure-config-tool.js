#!/usr/bin/env node

var program = require('commander');
const createFile = require('./functions/create-file');
const createKey = require('./functions/create-key');
const encryptSecret = require('./functions/encrypt-secret');
const decryptSecret = require('./functions/decrypt-secret');

program
    .command('create <config-file>')
    .description('creates an encrypted configuration out of an existing JSON configuration file')
    .option('-p, --patterns <pattern-list>', 'a comma-separated list of key-patterns that should be encrypted')
    .action(createFile).on('--help', function () {
        console.log('');
        console.log('If no patterns are specified with the -p option then the default patterns are used: \'user\',\'pass\',\'token\'.');
        console.log('For every supplied pattern a case-insensitive regex match will be done for every key of the original JSON.');
        console.log('If the match succeeds, the value of the key will be encrypted.');
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool create config.json > config-production.json');
        console.log('  $ secure-config-tool create -p "user,api,url" config.json > config-production.json');
        console.log('');
    });

program
    .command('encrypt <secret>')
    .description('encrypts a secret for a secure-config configuration')
    .option('-v, --verbose', 'verbose output')
    .action(encryptSecret).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool encrypt "MySecretPassword"');
        console.log('');
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
        console.log('');
    });

program
    .command('genkey')
    .description('generates a 32 byte AES key for encrypting/decrypting values for secure-config and returns the hex string')
    .action(createKey).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool genkey');
        console.log('');
    });

program.parse(process.argv);