const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

describe('secure-config-tool update-hmac test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_KEY_HEX_WRONG = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593b000';

    const cbDecrypt = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                cbSetValue(cryptUtils.decrypt(value, TEST_KEY_HEX));
            }
        }
    }

    const expectedConfig =
    {
        "database": {
            "host": "127.0.0.1",
            "username": "ENCRYPTED|a8c967bcf71a65fdeb29c6d965059fbf|04262ca07306dd7883c1c352a7083346",
            "password": "ENCRYPTED|acbdb333085cb712c514510b44fe78ff|5da8a72455986edc61e36b38d8660a4849d263577c5a9f4ccaff57bd6d8e35ee",
            "port": 1521
        },
        "__hmac": "38ba13feaab8cbdb790bb6aafd4b18b813bbee9b36cd10d314d1306ff1454dc2"
    }

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful HMAC update', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const updateHmac = require('../functions/update-hmac');
        updateHmac('./test/testfiles/config-hmac-update.json');
        expect(testOutput.length).toBe(1);
        let updatedJson = JSON.parse(testOutput[0]);
        let originalJson = JSON.parse(fs.readFileSync('./test/testfiles/config-hmac-update.json'));
        expect(updatedJson.database.host).toStrictEqual(originalJson.database.host);
        expect(updatedJson.database.user).toStrictEqual(originalJson.database.user);
        expect(updatedJson.database.pass).toStrictEqual(originalJson.database.pass);
        expect(updatedJson.database.port).toStrictEqual(originalJson.database.port);
        expect(updatedJson['__hmac']).not.toStrictEqual(originalJson['__hmac']);
        // check against new HAMC caluclatio on-the-fly
        jt.traverse(originalJson, cbDecrypt, true);
        delete originalJson['__hmac'];
        expect(updatedJson['__hmac']).toStrictEqual(oh.calculateHmac(originalJson, TEST_KEY_HEX));
        // double-check against pre.calculated HMAC
        expect(updatedJson['__hmac']).toStrictEqual(expectedConfig['__hmac']);
    });

    it('tests a successful HMAC update with a custom HMAC property', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const updateHmac = require('../functions/update-hmac');
        const customProp = '_signature';
        updateHmac('./test/testfiles/config-hmac-prop-update.json', { hmacProp: customProp });
        expect(testOutput.length).toBe(1);
        let updatedJson = JSON.parse(testOutput[0]);
        let originalJson = JSON.parse(fs.readFileSync('./test/testfiles/config-hmac-prop-update.json'));
        expect(updatedJson.database.host).toStrictEqual(originalJson.database.host);
        expect(updatedJson.database.user).toStrictEqual(originalJson.database.user);
        expect(updatedJson.database.pass).toStrictEqual(originalJson.database.pass);
        expect(updatedJson.database.port).toStrictEqual(originalJson.database.port);
        expect(updatedJson['__hmac']).toBeUndefined();
        expect(originalJson['__hmac']).toBeUndefined();
        expect(updatedJson[customProp]).toBeDefined();
        expect(originalJson[customProp]).toBeDefined();
        expect(updatedJson[customProp]).not.toStrictEqual(originalJson[customProp]);
        jt.traverse(originalJson, cbDecrypt, true);
        delete originalJson[customProp];
        expect(updatedJson[customProp]).toStrictEqual(oh.calculateHmac(originalJson, TEST_KEY_HEX));
    });

    it('tests a failed HMAC update because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const updateHmac = require('../functions/update-hmac');
        expect(() => {
            updateHmac('./test/testfiles/config-hmac-update.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('test a successful HMAC update with overwriting the existing file', () => {
        const result = JSON.stringify(expectedConfig, null, 2);
        const mockFileWrite = jest.spyOn(fs, 'writeFileSync')
            .mockImplementation((file, data) => { });
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const updateHmac = require('../functions/update-hmac');
        updateHmac('./test/testfiles/config-hmac-update.json', { overwrite: true });
        expect(mockFileWrite).toHaveBeenCalledWith('./test/testfiles/config-hmac-update.json', result);
    });

    it('tests a failed HMAC update because of a wrong key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX_WRONG;
        const updateHmac = require('../functions/update-hmac');
        expect(() => {
            updateHmac('./test/testfiles/config-hmac-update.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

});