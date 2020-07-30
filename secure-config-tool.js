#!/usr/bin/env node

var program = require('commander');
const createSecret = require('./functions/create-secret');

program
    .command('create')
    .description('creates an encrypted entry for secure-config')
    .option('-s, --secret <secret>', 'the secret value to be encryoted, asked if not provided')
    .option('-v, --verbose', 'verbose output')
    .action(createSecret).on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log('');
        console.log('  $ secure-config-tool create');
        console.log('  $ secure-config-tool create --secret MySecretPassword');
    });

program.parse(process.argv);