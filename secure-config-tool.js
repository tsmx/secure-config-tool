const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

var key = null;
if (!process.env.CONFIG_ENCRYPTION_KEY) {
    console.log('Environment variable CONFIG_ENCRYPTION_KEY not set.');
    process.exit(-1);
}
else if (process.env.CONFIG_ENCRYPTION_KEY.toString().length !== 32) {
    console.log('CONFIG_ENCRYPTION_KEY length must be 32 bytes.');
    process.exit(-1);
}
key = Buffer.from(process.env.CONFIG_ENCRYPTION_KEY);
console.log('CONFIG_ENCRYPTION_KEY found, using key: **************************' + process.env.CONFIG_ENCRYPTION_KEY.toString().slice(26));

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return 'ENCRYPTED|' + iv.toString('hex') + '|' + encrypted.toString('hex');
}

function decrypt(text) {
    let input = text.split('|');
    input.shift();
    let iv = Buffer.from(input[0], 'hex');
    let encryptedText = Buffer.from(input[1], 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter secret: ', (input) => {
    const hw = encrypt(input);
    console.log('\r\nEncrpyted secret - copy & paste this line into your config file:');
    console.log(hw);
    console.log('\r\nPlaintext for verification:');
    const check = decrypt(hw);
    console.log(check);
    if (check === input) {
        console.log('Success.');
    }
    else {
        console.log('Something went wrong...');
    }
    rl.close();
});