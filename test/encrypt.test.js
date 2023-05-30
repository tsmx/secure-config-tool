describe('secure-config-tool encrypt test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output); };

    const TEST_KEY = 'iC771qNLe+OGVcduw8fqpDIIK7lK0T5p';
    const TEST_SECRET = 'MySecret123$';

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful command line secret encryption', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const createSecret = require('../functions/encrypt-secret');
        createSecret(TEST_SECRET);
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].startsWith('ENCRYPTED|')).toBeTruthy();
    });

    it('tests a successful command line secret encryption with verbose output', () => {
        process.env['CONFIG_ENCRYPTION_KEY'] = TEST_KEY;
        const createSecret = require('../functions/encrypt-secret');
        createSecret(TEST_SECRET, { verbose: true });
        expect(testOutput.length).toBe(5);
        expect(testOutput[0].endsWith('lK0T5p')).toBeTruthy();
        expect(testOutput[1].startsWith('ENCRYPTED|')).toBeTruthy();
        expect(testOutput[3]).toBe(TEST_SECRET);
        expect(testOutput[4]).toBe('Success.');
    });

    it('tests a failed command line secret encryption because of a missing key', () => {
        const mockExit = jest.spyOn(process, 'exit')
            .mockImplementation((number) => { throw new Error('process.exit: ' + number); });
        const createSecret = require('../functions/encrypt-secret');
        expect(() => {
            createSecret({ secret: TEST_SECRET });
        }).toThrow();
        expect(mockExit).toHaveBeenCalledWith(-1);
        mockExit.mockRestore();
    });

});