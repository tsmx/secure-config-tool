describe('secure-config-tool decrypt test suite', () => {

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

});