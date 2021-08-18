describe('secure-config-tool create-file test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };
    const hexReg = new RegExp('^[0-9A-F]*$', 'i');

    const unencryptedHost = '127.0.0.1';
    const unencryptedUsername = 'SecretDbUser';
    const unencryptedPassword = 'SecretDbPassword';

    const TEST_KEY = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
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