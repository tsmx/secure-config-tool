const { verifyEncryptedJson, verifyUnencryptedJson } = require('./test-utils');

describe('secure-config-tool test-file test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output); };

    const TEST_KEY_HEX = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_KEY_HEX_WRONG = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593b000';
    const TEST_KEY_HEX_BROKEN = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bxxx';

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful file test', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const testFile = require('../functions/test-file');
        testFile('./test/testfiles/config-test.json');
        expect(testOutput.length).toBe(2);
        expect(testOutput[0].endsWith('PASSED')).toBeTruthy();
        expect(testOutput[1].endsWith('PASSED')).toBeTruthy();
    });

    it('tests a successful file test with encrypted object arrays', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const testFile = require('../functions/test-file');
        testFile('./test/testfiles/config-test-array.json');
        expect(testOutput.length).toBe(2);
        expect(testOutput[0].endsWith('PASSED')).toBeTruthy();
        expect(testOutput[1].endsWith('PASSED')).toBeTruthy();
    });

    it('tests a successful file test with verbose output', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const testFile = require('../functions/test-file');
        testFile('./test/testfiles/config-test.json', { verbose: true });
        expect(testOutput.length).toBe(6);
        let encryptedJson = JSON.parse(testOutput[1]);
        verifyEncryptedJson(encryptedJson);
        let decryptedJson = JSON.parse(testOutput[3]);
        verifyUnencryptedJson(decryptedJson);
        expect(testOutput[4].endsWith('PASSED')).toBeTruthy();
        expect(testOutput[5].endsWith('PASSED')).toBeTruthy();
    });

    it('tests a successful file test without HMAC validation', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const testFile = require('../functions/test-file');
        testFile('./test/testfiles/config-test.json', { skipHmac: true });
        expect(testOutput.length).toBe(2);
        expect(testOutput[0].endsWith('PASSED')).toBeTruthy();
        expect(testOutput[1].endsWith('not tested')).toBeTruthy();
    });

    it('tests a successful file test with a custom HMAC property name', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const testFile = require('../functions/test-file');
        testFile('./test/testfiles/config-test-hmacprop.json', { hmacProp: '_signature' });
        expect(testOutput.length).toBe(2);
        expect(testOutput[0].endsWith('PASSED')).toBeTruthy();
        expect(testOutput[1].endsWith('PASSED')).toBeTruthy();
    });

    it('tests a failed file test because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-test.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of a broken key (key not valid)', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX_BROKEN;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-test.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of a wrong key (key was not used for encryption)', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX_WRONG;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-test.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of a not existing file', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-testx.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of an invalid JSON file', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-broken-json.txt');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of a failed HMAC validation', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-broken-hmac.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

    it('tests a failed file test because of a failed HMAC validation with custom property name', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY_HEX;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const testFile = require('../functions/test-file');
        expect(() => {
            testFile('./test/testfiles/config-test.json', { hmacProp: '_signaturexxx' });
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

});