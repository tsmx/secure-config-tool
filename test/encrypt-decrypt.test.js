describe('encrypt-decrypt test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    const TEST_KEY = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
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

    it('tests a successful encryption and decryption', () => {
        const crypt = require('../utils/crypt');
        const encrypted = crypt.encrypt(TEST_SECRET, TEST_KEY);
        expect(encrypted).toBeDefined();
        let parts = encrypted.split('|');
        expect(parts).toBeDefined()
        expect(parts.length).toBe(3);
        expect(parts[0]).toBe('ENCRYPTED');
        const decrypted = crypt.decrypt(encrypted, TEST_KEY);
        expect(decrypted).toBeDefined();
        expect(decrypted).toStrictEqual(TEST_SECRET);
    });

    it('tests a successful decryption', () => {
        const crypt = require('../utils/crypt');
        const decrypted = crypt.decrypt(TEST_SECRET_ENCRYPTED, TEST_KEY);
        expect(decrypted).toBeDefined();
        expect(decrypted).toStrictEqual(TEST_SECRET);
    });

    it('tests a failed decryption - illegal secret structure', () => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = '2a8660e3e6614b58b1c1b13d5db49ff0|30d052eeab498181b7071e2d5ce0e71a';
            crypt.decrypt(encrypted, TEST_KEY);
        }).toThrow(DECRYPT_ERROR);
    });

    it('tests a failed decryption - illegal secret IV', () => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = 'ENCRYPTED|2a8660e3|30d052eeab498181b7071e2d5ce0e71a';
            crypt.decrypt(encrypted, TEST_KEY);
        }).toThrow(DECRYPT_ERROR);
    });

    it('tests a failed decryption - illegal secret data', () => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = 'ENCRYPTED|2a8660e3e6614b58b1c1b13d5db49ff0|30d052eeab498181b7071e2d5ce0';
            crypt.decrypt(encrypted, TEST_KEY);
        }).toThrow(DECRYPT_ERROR);
    });

});