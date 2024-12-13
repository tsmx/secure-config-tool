const cryptUtils = require('../utils/crypt');

describe('secure-config-tool rotate-key test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output); };

    const TEST_KEY_HEX_OLD = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593bd0f';
    const TEST_KEY_HEX_NEW = '9af7d400be4705147dc724db25bfd2513aa11d6013d7bf7bdb2bfe050593b000';

    beforeEach(() => {
        delete process.env[cryptUtils.CONFIG_ENCRYPTION_KEY];
        delete process.env[cryptUtils.CONFIG_ENCRYPTION_KEY_NEW];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a failed key rotation because of a missing old key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const rotateKey = require('../functions/rotate-key');
        expect(() => {
            rotateKey('./test/testfiles/config-test.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        expect(testOutput.length).toEqual(1);
        expect(testOutput[0]).toEqual(`Environment variable ${cryptUtils.CONFIG_ENCRYPTION_KEY} not set.`);
        mockExit.mockRestore();
    });

    it('tests a failed key rotation because of a missing new key', () => {
        process.env[cryptUtils.CONFIG_ENCRYPTION_KEY] = TEST_KEY_HEX_OLD;
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const rotateKey = require('../functions/rotate-key');
        expect(() => {
            rotateKey('./test/testfiles/config-test.json');
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        expect(testOutput.length).toEqual(1);
        expect(testOutput[0]).toEqual(`Environment variable ${cryptUtils.CONFIG_ENCRYPTION_KEY_NEW} not set.`);
        mockExit.mockRestore();
    });

    it('tests a successful key rotation', () => {
        process.env[cryptUtils.CONFIG_ENCRYPTION_KEY] = TEST_KEY_HEX_OLD;
        process.env[cryptUtils.CONFIG_ENCRYPTION_KEY_NEW] = TEST_KEY_HEX_NEW;
        const rotateKey = require('../functions/rotate-key');
        rotateKey('./test/testfiles/config-test.json');
        expect(testOutput.length).toBe(1);
        let updatedJson = JSON.parse(testOutput[0]);
        expect(updatedJson.database.host).toStrictEqual('127.0.0.1');
        expect(updatedJson.database.username).toBeDefined();
        expect(updatedJson.database.password).toBeDefined();
        expect(updatedJson['__hmac']).toBeDefined();
    });

});