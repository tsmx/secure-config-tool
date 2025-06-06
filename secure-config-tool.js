#!/usr/bin/env node

var { program } = require('commander');
const createFile = require('./functions/create-file');
const updateHmac = require('./functions/update-hmac');
const rotateKey = require('./functions/rotate-key');
const testFile = require('./functions/test-file');
const createKey = require('./functions/create-key');
const encryptSecret = require('./functions/encrypt-secret');
const decryptSecret = require('./functions/decrypt-secret');
const helpTexts = require('./utils/helptexts');

program
    .description('Supporting command line tool for the @tsmx/secure-config npm package')
    .version('2.4.0');

program
    .command('create <config-file>')
    .description('Create a secure-config out of an existing JSON configuration file')
    .option('-p, --patterns <pattern-list>', 'a comma-separated list of key-patterns that should be encrypted')
    .option('--ne, --no-encryption', 'don\'t encrypt any configuration value, e.g. if you only want to use the HMAC feature')
    .option('--nh, --no-hmac', 'don\'t generate a HMAC for the configuration')
    .option('--hp, --hmac-prop <hmac-prop>', 'custom name of the property to store the HMAC in, default is \'__hmac\'')
    .action(createFile)
    .addHelpText('after', helpTexts.createHelpText);

program
    .command('update-hmac <config-file>')
    .description('Update the HMAC of an existing secure-config configuration file')
    .option('-o, --overwrite', 'overwrite file directly instead of writing to stdout')
    .option('--hp, --hmac-prop <hmac-prop>', 'custom name of the HMAC property to be updated, default is \'__hmac\'')
    .action(updateHmac)
    .addHelpText('after', helpTexts.updateHelpText);

program
    .command('rotate-key <config-file>')
    .description('Rotates the key of an existing secure-config configuration file')
    .option('-o, --overwrite', 'overwrite file directly instead of writing to stdout')
    .option('--hp, --hmac-prop <hmac-prop>', 'custom name of the HMAC property to be updated with the new key (if one), default is \'__hmac\'')
    .action(rotateKey)
    .addHelpText('after', helpTexts.rotateHelpText);

program
    .command('test <config-file>')
    .description('Test decryption and HMAC validation for an existing secure-config configuration file')
    .option('--hp, --hmac-prop <hmac-prop>', 'custom name of the HMAC property to validate, default is \'__hmac\'')
    .option('--sh, --skip-hmac', 'skip HMAC validation test')
    .option('-v, --verbose', 'verbose output')
    .action(testFile)
    .addHelpText('after', helpTexts.testHelpText);

program
    .command('genkey')
    .description('Generate a 32 byte AES key for encrypting/decrypting values and returns the hex string')
    .action(createKey)
    .addHelpText('after', helpTexts.genkeyHelpText);

program
    .command('encrypt <secret>')
    .description('Encrypt a single secret string for a secure-config configuration')
    .option('-v, --verbose', 'verbose output')
    .action(encryptSecret)
    .addHelpText('after', helpTexts.encryptHelpText);

program
    .command('decrypt <secret>')
    .description('Decrypt an encrypted entry of a secure-config for testing/validation purposes')
    .option('-v, --verbose', 'verbose output')
    .action(decryptSecret)
    .addHelpText('after', helpTexts.decryptHelpText);

program.parse(process.argv);