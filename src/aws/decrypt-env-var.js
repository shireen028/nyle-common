const { AWS } = require('./aws');
const { logger } = require('../logger');

/*
/ !!!!BEWARE ALL YE WHO ENTER HERE!!!!
/ This code was written for manual encoding/decoding of strings in the SSM
/ parameter store, before we figured out how to just default them to secure
/ strings. It really should only be used in a few places that use those legacy
/ keys. Other than that, please look at ./ssm.js and the fetchSecretsFromSSM method,
/ as that is probably what you are actually looking for.
 */
async function decryptEnvVar(key) {
    let envVar;
    const callerPassedEnvironmentVariableName = !!process.env[key];
    if (process.env[key]) {
        envVar = process.env[key];
    } else {
        logger.warn('Passing encrypted environment variable directly to decryptEnvVar is deprecated. Please update your code to use `decryptEnvVar(ENVIRONMENT_VARIABLE_NAME)`');
        envVar = key;
    }
    let res;
    if (process.env.USE_UNENCRYPTED_ENV_VARS) {
        res = envVar;
    } else {
        const kms = new AWS.KMS();
        let data;
        try {
            data = await kms.decrypt({
                CiphertextBlob: Buffer.from(envVar, 'base64'),
            }).promise();
        } catch (err) {
            if (callerPassedEnvironmentVariableName) logger.error(`Failed to decrypt process.env.${key}`);
            throw err;
        }
        res = data.Plaintext.toString('ascii');
    }
    return res;
}

module.exports = {
    decryptEnvVar,
};

if (require.main === module) {
    /* eslint-disable global-require, no-console */
    const assert = require('assert');
    (async () => {
        const existingKey = 'HONEYWELL_EVENT_HUB_ENDPOINT';
        const res = await decryptEnvVar(existingKey);
        assert(!!res, `Unable to decrypt ${existingKey}`);
        try {
            const nonExistentKey = String(Date.now());
            await decryptEnvVar(nonExistentKey);
            assert(false, `successfully decrypted process.env.${nonExistentKey}`);
        } catch (err) {
            console.error('Should see a deprectation warning above this message, but no ERROR message');
        }
    })();
}
