#!/usr/bin/env node

var { program } = require('commander');
const createFile = require('./functions/create-file');
const createKey = require('./functions/create-key');
const encryptSecret = require('./functions/encrypt-secret');
const decryptSecret = require('./functions/decrypt-secret');

const { createHelpText, genkeyHelpText, encryptHelpText, decryptHelpText } = require('./utils/helptexts');

program
    .command('create <config-file>')
    .description('Creates a secure-config out of an existing JSON configuration file.')
    .option('-p, --patterns <pattern-list>', 'a comma-separated list of key-patterns that should be encrypted')
    .option('-ne, --no-encryption', 'don\'t encrypt any configuration value, e.g. if you only want to use the HMAC feature')
    .option('-nh, --no-hmac', 'don\'t generate a HMAC for the configuration')
    .option('-hp, --hmac-prop <hmac-prop>', 'custom name of the property to store the HMAC in, default is \'__hmac\'')
    .action(createFile)
    .addHelpText('after', createHelpText);

program
    .command('genkey')
    .description('Generates a 32 byte AES key for encrypting/decrypting values for secure-config and returns the hex string.')
    .action(createKey)
    .addHelpText('after', genkeyHelpText);

program
    .command('encrypt <secret>')
    .description('Encrypts a secret for a secure-config configuration.')
    .option('-v, --verbose', 'verbose output')
    .action(encryptSecret)
    .addHelpText('after', encryptHelpText);

program
    .command('decrypt <secret>')
    .description('Decrypts an encrypted entry for secure-config for testing/validation purposes.')
    .option('-v, --verbose', 'verbose output')
    .action(decryptSecret)
    .addHelpText('after', decryptHelpText);

program.parse(process.argv);