const hexReg = new RegExp('^[0-9A-F]*$', 'i');

const unencryptedHost = '127.0.0.1';
const unencryptedUsername = 'SecretDbUser';
const unencryptedPassword = 'SecretDbPassword';
const unencryptedArrayItemValue1 = 'arrayItemValue1';
const unencryptedArrayItemValue2 = 'arrayItemValue2';
const unencryptedSubArrayItemValue1 = 'subArrayItemValue1';

function verifyEncryptedValue(encrypted, unencrypted) {
    expect(encrypted).not.toStrictEqual(unencrypted);
    let encryptedParts = encrypted.split('|');
    expect(encryptedParts.length).toBe(3);
    expect(encryptedParts[0]).toStrictEqual('ENCRYPTED');
    expect(hexReg.test(encryptedParts[1])).toBeTruthy();
    expect(hexReg.test(encryptedParts[2])).toBeTruthy();
}

module.exports.verifyEncryptedValue = verifyEncryptedValue;

module.exports.verifyEncryptedJson = function (encryptedJson) {
    expect(encryptedJson).toBeDefined();
    expect(encryptedJson.database).toBeDefined();
    expect(encryptedJson.database.host).toBeDefined();
    expect(encryptedJson.database.host).toStrictEqual(unencryptedHost);
    expect(encryptedJson.database.username).toBeDefined();
    verifyEncryptedValue(encryptedJson.database.username, unencryptedUsername);
    expect(encryptedJson.database.password).toBeDefined();
    verifyEncryptedValue(encryptedJson.database.password, unencryptedPassword);
};

module.exports.verifyUnencryptedJson = function (unencryptedJson) {
    expect(unencryptedJson).toBeDefined();
    expect(unencryptedJson.database).toBeDefined();
    expect(unencryptedJson.database.host).toBeDefined();
    expect(unencryptedJson.database.host).toStrictEqual(unencryptedHost);
    expect(unencryptedJson.database.username).toBeDefined();
    expect(unencryptedJson.database.username).toStrictEqual(unencryptedUsername);
    expect(unencryptedJson.database.password).toBeDefined();
    expect(unencryptedJson.database.password).toStrictEqual(unencryptedPassword);
};

module.exports.verifyUnencryptedJsonArray = function (unencryptedJson) {
    expect(unencryptedJson.testarray).toBeDefined();
    expect(unencryptedJson.testarray[0]).toStrictEqual('one');
    expect(unencryptedJson.testarray[1]).toStrictEqual('two');
    expect(unencryptedJson.testarray[2]).toStrictEqual('three');
    expect(unencryptedJson.testarray[3].arrayItemKey).toStrictEqual('arrayItemValue1');
    expect(unencryptedJson.testarray[3].additionalItem1).toStrictEqual('value1');
    expect(unencryptedJson.testarray[4].arrayItemKey).toStrictEqual('arrayItemValue2');
    expect(unencryptedJson.testarray[4].additionalItem1).toStrictEqual('value1');
    expect(unencryptedJson.testarray[4].additionalItem2).toStrictEqual(12);
    expect(unencryptedJson.testarray[5][0].subArrayItemKey).toStrictEqual('subArrayItemValue1');
};