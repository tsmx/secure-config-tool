describe('key generation and retrieval test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    const TEST_KEY = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_KEY_BROKEN = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T';

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful key generation', () => {
        const crypt = require('../utils/crypt');
        const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
        const key = crypt.genkey();
        expect(key).toBeDefined();
        expect(key.length).toBe(64);
        expect(hexReg.test(key)).toBeTruthy();
        expect(Buffer.from(key, 'hex').length).toBe(32);
    });

    it('tests a successful key retrieval', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const crypt = require('../utils/crypt');
        expect(testOutput.length).toBe(0);
        const key = crypt.retrieveKey(true);
        expect(key).toBeDefined();
        expect(key.length).toBe(32);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].startsWith('CONFIG_ENCRYPTION_KEY found')).toBeTruthy();
        expect(testOutput[0].endsWith('0T5p')).toBeTruthy();
    });

    it('tests a successful key retrieval for a hexadecimal string', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const crypt = require('../utils/crypt');
        expect(testOutput.length).toBe(0);
        const key = crypt.retrieveKey(true);
        expect(key).toBeDefined();
        expect(key.length).toBe(64);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].startsWith('CONFIG_ENCRYPTION_KEY found')).toBeTruthy();
        expect(testOutput[0].endsWith('bd0f')).toBeTruthy();
    });

    it('tests a failed key retrieval - no key found', () => {
        expect(() => {
            const crypt = require('../utils/crypt');
            crypt.retrieveKey();
        }).toThrow('Environment variable CONFIG_ENCRYPTION_KEY not set.');
    });

    it('tests a failes key retrieval - invalid key length', () => {
        expect(() => {
            process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_BROKEN;
            const crypt = require('../utils/crypt');
            crypt.retrieveKey();
        }).toThrow('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
    });

});