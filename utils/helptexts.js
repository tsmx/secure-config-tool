module.exports.createHelpText = `
If no patterns are specified with the -p option then the default patterns are used: \'user\',\'pass\',\'token\'.
For every supplied pattern a case-insensitive regex match will be done for every key of the original JSON.
If the match succeeds, the value of the key will be encrypted.

Examples:

Generate a secure-config with a HMAC and standard patterns for encryption
$ secure-config-tool create config.json > config-production.json

Generate a secure-config without HMAC and only encrypted values
$ secure-config-tool create -nh config.json > config-production.json

Generate a secure-config with a HMAC but without encrypting any values
$ secure-config-tool create -ne config.json > config-production.json

Generate a secure-config with custom encryption patterns 'user, 'api' and 'url' and a custom HMAC property named '_signature'
$ secure-config-tool create -hp "_signature" -p "user,api,url" config.json > config-production.json
`;

module.exports.genkeyHelpText = `
Examples:
$ secure-config-tool genkey
`;

module.exports.encryptHelpText = `
Examples:

$ secure-config-tool encrypt "MySecretPassword"
`;

module.exports.decryptHelpText = `
Examples:

$ secure-config-tool decrypt "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
$ secure-config-tool decrypt --verbose "ENCRYPTED|82da1c22e867d68007d66a23b7b748b3|452a2ed1105ec5607576b820b90aa49f"
`;