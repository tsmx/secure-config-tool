const fs = require('fs');
const jt = require('@tsmx/json-traverse');
const oh = require('@tsmx/object-hmac');
const cryptUtils = require('../utils/crypt');

describe('secure-config-tool update-hmac test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';

    const cbDecrypt = {
        processValue: (key, value, level, path, isObjectRoot, isArrayElement, cbSetValue) => {
            if (!isArrayElement && value && value.toString().startsWith(cryptUtils.ENCRYPTION_PREFIX)) {
                cbSetValue(cryptUtils.decrypt(value, TEST_KEY_HEX));
            }
        }
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
        jt.traverse(originalJson, cbDecrypt, true);
        delete originalJson['__hmac'];
        expect(updatedJson['__hmac']).toStrictEqual(oh.calculateHmac(originalJson, TEST_KEY_HEX));
    });

});