const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

describe('secure-config-tool update-hmac test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output); };

    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_KEY_HEX_WRONG = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593b000';

    const cbDecrypt = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                cbSetValue(cryptUtils.decrypt(value, TEST_KEY_HEX));
            }
        }
    };

    const expectedConfig =
    {
        database: {
            host: '127.0.0.1',
            username: 'ENCRYPTED|4129b62487b3f8af7bd1336ce11a5dad|b1925e96359a62fb53812a7ae6b4a2c3',
            password: 'ENCRYPTED|466bbb68c2f7356765e35af4c3bfbb9b|4d2bee19431fff5288b54d7516704f4caf6f823018b3b30dde850e076571d3db',
            port: 1521
        },
        testarray: [
            'one',
            'two',
            'three',
            {
                arrayItemKey: 'ENCRYPTED|8e31b4ff5e13a612a0c4db50b3c62f2f|421170f2a05f0a6008a821ab9e739d53',
                additionalItem1: 'value1'
            },
            {
                arrayItemKey: 'ENCRYPTED|d8e4eb8823189d226af0b46f52f0ccf3|e9de6b56808ed58b0d3a5a53c369caa0',
                additionalItem1: 'value1',
                additionalItem2: 12
            },
            [
                {
                    subArrayItemKey: 'ENCRYPTED|47e7fbeedb625388d54fffb5d1515442|e6f7c69dd8ad5d73760acf7a3de4f77be8d3f9856f7fffd9ac744ecfa4c5d519'
                }
            ]
        ],
        __hmac: 'c807d4d9f6d9daa2105c7684abc7a87a94755807380bc74f6efe8e9af311f7a8'
    };

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
        // check against new HAMC calculation on-the-fly
        jt.traverse(originalJson, cbDecrypt);
        delete originalJson['__hmac'];
        expect(updatedJson['__hmac']).toStrictEqual(oh.calculateHmac(originalJson, TEST_KEY_HEX));
        // double-check against pre-calculated HMAC
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
        jt.traverse(originalJson, cbDecrypt);
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
            .mockImplementation((_file, _data) => { });
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