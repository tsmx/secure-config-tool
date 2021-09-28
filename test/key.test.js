describe('secure-config-tool key test suite', () => {

    var testOutput = [];
    const originalConsoleLog = console.log;
    const testConsoleLog = (output) => { testOutput.push(output) };

    beforeEach(() => {
        delete process.env['CONFIG_ENCRYPTION_KEY'];
        jest.resetModules();
        console.log = testConsoleLog;
        testOutput = [];

    });

    afterEach(() => {
        console.log = originalConsoleLog;
    });

    it('tests a successful command line key generation', () => {
        const createKey = require('../functions/create-key');
        const hexReg = new RegExp('^[0-9A-F]{64}$', 'i');
        createKey();
        expect(testOutput.length).toBe(1);
        expect(testOutput[0].length).toBe(64);
        expect(hexReg.test(testOutput[0])).toBeTruthy();
        expect(Buffer.from(testOutput[0], 'hex').length).toBe(32);
    });

});