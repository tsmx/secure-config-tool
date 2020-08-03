describe('secure-config-tool test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    beforeEach(() => {
        jest.resetModules();
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful encryption and decryption', async (done) => {
        const crypt = require('../utils/crypt');
        const text = 'TestSecret-123!';
        const key = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
        const encrypted = crypt.encrypt(text, key);
        expect(encrypted).toBeDefined();
        let parts = encrypted.split('|');
        expect(parts).toBeDefined()
        expect(parts.length).toBe(3);
        expect(parts[0]).toBe('ENCRYPTED');
        const decrypted = crypt.decrypt(encrypted, key);
        expect(decrypted).toBeDefined();
        expect(decrypted).toBe(text);
        done();
    });

    it('tests a successful decryption', async (done) => {
        const crypt = require('../utils/crypt');
        const encrypted = 'ENCRYPTED|2a8660e3e6614b58b1c1b13d5db49ff0|30d052eeab498181b7071e2d5ce0e71a';
        const key = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
        const decrypted = crypt.decrypt(encrypted, key);
        expect(decrypted).toBeDefined();
        expect(decrypted).toBe('MySecret123$');
        done();
    });

    it('tests a failed decryption - illegal secret structure', async (done) => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = '2a8660e3e6614b58b1c1b13d5db49ff0|30d052eeab498181b7071e2d5ce0e71a';
            const key = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
            const decrypted = crypt.decrypt(encrypted, key);
        }).toThrow('Decryption faild. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
            'Please see the docs under: https://github.com/tsmx/secure-config');
        done();
    });

    it('tests a failed decryption - illegal secret IV', async (done) => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = 'ENCRYPTED|2a8660e3|30d052eeab498181b7071e2d5ce0e71a';
            const key = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
            const decrypted = crypt.decrypt(encrypted, key);
        }).toThrow('Decryption faild. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
            'Please see the docs under: https://github.com/tsmx/secure-config');
        done();
    });

    it('tests a failed decryption - illegal secret DATA', async (done) => {
        expect(() => {
            const crypt = require('../utils/crypt');
            const encrypted = 'ENCRYPTED|2a8660e3e6614b58b1c1b13d5db49ff0|30d052eeab498181b7071e2d5ce0';
            const key = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
            const decrypted = crypt.decrypt(encrypted, key);
        }).toThrow('Decryption faild. Please check that the encrypted secret is valid and has the form "ENCRYPTED|IV|DATA"\n' +
            'Please see the docs under: https://github.com/tsmx/secure-config');
        done();
    });

    it('tests a successful key generation', async (done) => {
        const crypt = require('../utils/crypt');
        const key = crypt.genkey();
        expect(key).toBeDefined();
        expect(key.length).toBe(32);
        done();
    });

    it('tests a successful key retrieval', async (done) => {
        process.env['CONFIG_ENCRYPTION_KEY'] = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
        const crypt = require('../utils/crypt');
        expect(testOutput.length).toBe(0);
        const key = crypt.retrieveKey(true);
        expect(key).toBeDefined();
        expect(key.length).toBe(32);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].startsWith('CONFIG_ENCRYPTION_KEY found')).toBeTruthy();
        expect(testOutput[0].endsWith('0T5p')).toBeTruthy();
        done();
    });

    it('tests a failes key retrieval - no key found', async (done) => {
        expect(() => {
            const crypt = require('../utils/crypt');
            crypt.retrieveKey();
        }).toThrow('Environment variable CONFIG_ENCRYPTION_KEY not set.');
        done();
    });

    it('tests a failes key retrieval - invalid key length', async (done) => {
        expect(() => {
            process.env['CONFIG_ENCRYPTION_KEY'] = 'iC771qNLe+OGVcduw8fqpDIIK7lK';
            const crypt = require('../utils/crypt');
            crypt.retrieveKey();
        }).toThrow('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
        done();
    });

});