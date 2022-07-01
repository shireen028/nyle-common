const { AWS } = require('../aws');

module.exports = class DevicePowerClient {
    constructor({
        prefix,
    }) {
        const lambda = new AWS.Lambda();
        this.getDevicePowerByVPP = () => lambda.invoke({
            LogType: 'None',
            InvocationType: 'RequestResponse',
            FunctionName: `${prefix}-getDevicePowerByVPP`,
        }).promise()
            .then((response) => {
                const responsePayload = response.Payload ? JSON.parse(response.Payload) : null;
                if (responsePayload && responsePayload.errorMessage) {
                    throw responsePayload;
                } else {
                    return responsePayload;
                }
            });
    }
};
