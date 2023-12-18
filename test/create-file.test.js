const { verifyEncryptedJson, verifyUnencryptedJson, verifyUnencryptedJsonArray, verifyEncryptedValue } = require('./test-utils');

describe('secure-config-tool create-file test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output); };

    const unencryptedHost = '127.0.0.1';
    const unencryptedUsername = 'SecretDbUser';
    const unencryptedPassword = 'SecretDbPassword';
    const unencryptedDatabase = 'MyDB';
    const unencryptedArrayItemValue1 = 'arrayItemValue1';
    const unencryptedArrayItemValue2 = 'arrayItemValue2';
    const unencryptedSubArrayItemValue1 = 'subArrayItemValue1';

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
        verifyEncryptedJson(encryptedJson);
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
        verifyEncryptedJson(encryptedJson);
        expect(encryptedJson['__hmac']).toBeDefined();
        expect(encryptedJson['__hmac']).toStrictEqual(expectedHmac);
    });

    it('tests a successful command line file encryption with a hex key and custom patterns', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config.json', { patterns: 'host,pass' });
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        verifyEncryptedValue(encryptedJson.database.host, unencryptedHost);
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).toBe(unencryptedUsername);
        expect(encryptedJson.database.password).toBeDefined();
        verifyEncryptedValue(encryptedJson.database.password, unencryptedPassword);
        expect(encryptedJson['__hmac']).toBeDefined();
        expect(encryptedJson['__hmac']).toStrictEqual(expectedHmac);
    });

    it('tests a successful command line file encryption with a hex key and custom patterns and an ambiguous property name', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const oh = require('@tsmx/object-hmac');
        const originalConfig = require('./testfiles/config-ambiguous-prop.json');
        const expectedHmac = oh.calculateHmac(originalConfig, TEST_KEY_HEX);
        const createFile = require('../functions/create-file');
        createFile('./test/testfiles/config-ambiguous-prop.json', { patterns: 'host,pass,database' });
        expect(testOutput.length).toBe(1);
        let encryptedJson = JSON.parse(testOutput[0]);
        expect(encryptedJson).toBeDefined();
        expect(encryptedJson.database).toBeDefined();
        expect(encryptedJson.database.host).toBeDefined();
        verifyEncryptedValue(encryptedJson.database.host, unencryptedHost);
        expect(encryptedJson.database.username).toBeDefined();
        expect(encryptedJson.database.username).toBe(unencryptedUsername);
        expect(encryptedJson.database.password).toBeDefined();
        verifyEncryptedValue(encryptedJson.database.password, unencryptedPassword);
        expect(encryptedJson.database.database).toBeDefined();
        verifyEncryptedValue(encryptedJson.database.database, unencryptedDatabase);
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
        let unencryptedJson = JSON.parse(testOutput[0]);
        verifyUnencryptedJson(unencryptedJson);
        verifyUnencryptedJsonArray(unencryptedJson);
        expect(unencryptedJson['__hmac']).toBeDefined();
        expect(unencryptedJson['__hmac']).toStrictEqual(expectedHmac);
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