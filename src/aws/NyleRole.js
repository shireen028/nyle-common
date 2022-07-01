const uuid = require('uuid/v4');
const { AWS } = require('./aws');

module.exports.NyleRole = class NyleRole {
    constructor({ roleARN }) {
        /*
         * runs a delegate with environment variables set to the access keys for the role
         * NOTE: this is relying on environment globals and so any other AWS operations
         *       while this one is running will be in the role context. You should not try
         *       and do multi-role operation in parallel while using this (it isn't designed
         *       for that).
         *  new NyleRole({ roleARN : '...'})
         *      .assumeRole(() => operationInRole()).then(() => operationAsIAMUser())
         */
        this.assumeRole = (delegateInRole) => {
            const cache = {
                AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            };
            const resetEnv = () => {
                process.env.AWS_ACCESS_KEY_ID = cache.AWS_ACCESS_KEY_ID;
                process.env.AWS_SECRET_ACCESS_KEY = cache.AWS_SECRET_ACCESS_KEY;
                process.env.AWS_SESSION_TOKEN = cache.AWS_SESSION_TOKEN;
            };
            const sts = new AWS.STS();
            return sts.assumeRole({
                DurationSeconds: 900,
                RoleArn: roleARN,
                RoleSessionName: uuid(),
            }).promise()
                .then((res) => {
                    process.env.AWS_ACCESS_KEY_ID = res.Credentials.AccessKeyId;
                    process.env.AWS_SECRET_ACCESS_KEY = res.Credentials.SecretAccessKey;
                    process.env.AWS_SESSION_TOKEN = res.Credentials.SessionToken;

                    return delegateInRole();
                })
                .then(
                    (res) => {
                        resetEnv();
                        return res;
                    },
                    (err) => {
                        resetEnv();
                        return Promise.reject(err);
                    },
                );
        };
    }
};
