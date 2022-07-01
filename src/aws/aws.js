// aws-sdk is always available in the lambda runtime so it should not
// be listed in prod dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');

function enableAWSXray() {
    // eslint-disable-next-line import/no-extraneous-dependencies
    return AWSXRay.captureAWS(AWS);
}

module.exports = {
    AWS: process.env.ENABLE_AWS_XRAY === 'true' ? enableAWSXray(AWS) : AWS,
};
