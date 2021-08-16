describe('secure-config-tool main test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };
    const hexReg = new RegExp('^[0-9A-F]*$', 'i');

    const unencryptedHost = '127.0.0.1';
    const unencryptedUsername = 'SecretDbUser';
    const unencryptedPassword = 'SecretDbPassword';

    const TEST_KEY = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_SECRET = 'MySecret123$';
    const TEST_SECRET_ENCRYPTED = 'ENCRYPTED|f43fda7e3486b77a46b77b1c0b35e3db|9d329de17378813ffe21117360dfe3fa';
    const DECRYPT_ERROR = 'Decryption failed. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
        'Please see the docs under: https://github.com/tsmx/secure-config';

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful command line key generation', () => {
        const createKey = require('../functions/create-key');
        const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
        createKey();
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].length).toBe(64);
        expect(hexReg.test(testOutput[0])).toBeTruthy();
        expect(Buffer.from(testOutput[0], 'hex').length).toBe(32);
    });

    it('tests a successful command line secret encryption', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const createSecret = require('../functions/encrypt-secret');
        createSecret(TEST_SECRET);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].startsWith('ENCRYPTED|')).toBeTruthy();
    });

    it('tests a successful command line secret encryption with verbose output', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const createSecret = require('../functions/encrypt-secret');
        createSecret(TEST_SECRET, { verbose: true });
        expect(testOutput.length).toBe(5);
        expect(testOutput[0].endsWith('lK0T5p')).toBeTruthy();
        expect(testOutput[1].startsWith('ENCRYPTED|')).toBeTruthy();
        expect(testOutput[3]).toBe(TEST_SECRET);
        expect(testOutput[4]).toBe('Success.');
    });

    it('tests a failed command line secret encryption because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const createSecret = require('../functions/encrypt-secret');
        expect(() => {
            createSecret({ secret: TEST_SECRET });
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a successful command line secret decryption', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const decryptSecret = require('../functions/decrypt-secret');
        decryptSecret(TEST_SECRET_ENCRYPTED, null);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0]).toBe(TEST_SECRET);
    });

    it('tests a successful command line secret decryption with verbose output', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const decryptSecret = require('../functions/decrypt-secret');
        decryptSecret(TEST_SECRET_ENCRYPTED, { verbose: true });
        expect(testOutput.length).toBe(2);
        expect(testOutput[0].endsWith('lK0T5p')).toBeTruthy();
        expect(testOutput[1]).toBe(TEST_SECRET);
    });

    it('tests a failed command line secret decryption because of a broken secret', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const decryptSecret = require('../functions/decrypt-secret');
        expect(() => {
            decryptSecret('ENCRYPTED|f43fda7e3486b77a46b77b1c0b35e3db|9d329de17378813ffe21117360dfe3', null);
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
        expect(testOutput.length).toBe(1);
        expect(testOutput[0]).toBe(DECRYPT_ERROR);
    });

    it('tests a failed command line secret decryption because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const decryptSecret = require('../functions/decrypt-secret');
        expect(() => {
            decryptSecret(TEST_SECRET_ENCRYPTED, null);
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
        expect(testOutput.length).toBe(1);
        expect(testOutput[0]).toBe('Environment variable CONFIG_ENCRYPTION_KEY not set.');
    });

    it('tests a successful command line file encryption with default patterns', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json');
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        expect(encryptedJson.database.host).toBe(unencryptedHost);
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).not.toBe(unencryptedUsername);
        let usenameParts = encryptedJson.database.username.split('|');
        expect(usenameParts.length).toBe(3);
        expect(usenameParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(usenameParts[1])).toBeTruthy();
        expect(hexReg.test(usenameParts[2])).toBeTruthy();
        expect(encryptedJson.database.password).toBeDefined();
        expect(encryptedJson.database.password).not.toBe(unencryptedPassword);
        let passwordParts = encryptedJson.database.password.split('|');
        expect(passwordParts.length).toBe(3);
        expect(passwordParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(passwordParts[1])).toBeTruthy();
        expect(hexReg.test(passwordParts[2])).toBeTruthy();
    });

    it('tests a successful command line file encryption with a hex key and default patterns', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json');
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        expect(encryptedJson.database.host).toBe(unencryptedHost);
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).not.toBe(unencryptedUsername);
        let usenameParts = encryptedJson.database.username.split('|');
        expect(usenameParts.length).toBe(3);
        expect(usenameParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(usenameParts[1])).toBeTruthy();
        expect(hexReg.test(usenameParts[2])).toBeTruthy();
        expect(encryptedJson.database.password).toBeDefined();
        expect(encryptedJson.database.password).not.toBe(unencryptedPassword);
        let passwordParts = encryptedJson.database.password.split('|');
        expect(passwordParts.length).toBe(3);
        expect(passwordParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(passwordParts[1])).toBeTruthy();
        expect(hexReg.test(passwordParts[2])).toBeTruthy();
        expect(encryptedJson['__hmac']).toBeDefined();
        expect(encryptedJson['__hmac']).toStrictEqual(expectedHmac);
    });

    it('tests a successful command line file encryption with a hex key and custom patterns', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json', { patterns: 'host,pass'});
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        expect(encryptedJson.database.host).not.toBe(unencryptedHost);
        let hostParts = encryptedJson.database.host.split('|');
        expect(hostParts.length).toBe(3);
        expect(hostParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(hostParts[1])).toBeTruthy();
        expect(hexReg.test(hostParts[2])).toBeTruthy();
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).toBe(unencryptedUsername);
        expect(encryptedJson.database.password).toBeDefined();
        expect(encryptedJson.database.password).not.toBe(unencryptedPassword);
        let passwordParts = encryptedJson.database.password.split('|');
        expect(passwordParts.length).toBe(3);
        expect(passwordParts[0]).toBe('ENCRYPTED');
        expect(hexReg.test(passwordParts[1])).toBeTruthy();
        expect(hexReg.test(passwordParts[2])).toBeTruthy();
        expect(encryptedJson['__hmac']).toBeDefined();
        expect(encryptedJson['__hmac']).toStrictEqual(expectedHmac);
    });

    it('tests a successful command line file encryption without HMAC generation', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json', { hmac: false });
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson['__hmac']).toBeUndefined();
    });

    it('tests a successful command line file encryption with a custom HMAC property', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json', { hmacProp: '_signature' });
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson['_signature']).toBeDefined();
        expect(encryptedJson['_signature']).toStrictEqual(expectedHmac);
    });

    it('tests a successful command line processing without any encryption but HMAC generation with a hex key', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json', { encryption: false });
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        expect(encryptedJson.database.host).toStrictEqual(unencryptedHost);
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).toStrictEqual(unencryptedUsername);
        expect(encryptedJson.database.password).toBeDefined();
        expect(encryptedJson.database.password).toStrictEqual(unencryptedPassword);
        expect(encryptedJson['__hmac']).toBeDefined();
        expect(encryptedJson['__hmac']).toStrictEqual(expectedHmac);
    });

    it('tests a failed command line file encryption because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const createFile = require('../functions/create-file');
        expect(() => {
            createFile('./test/testfiles/config.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

});