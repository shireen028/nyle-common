const AWS = require('aws-sdk');
const {
    VPPConfigClient,
} = require('../../src/clients/vpp-config-client');
const {
    TEST_VPP,
} = require('../config');

const {
    DYNAMO_TABLE_VPP_CONFIGURATION,
} = process.env;

const documentClient = new AWS.DynamoDB.DocumentClient();

const configClient = new VPPConfigClient({
    tableName: DYNAMO_TABLE_VPP_CONFIGURATION,
});

describe('VPPConfigurationClient#iterateOverVpps', () => {
    let vppCount;
    beforeAll(async () => {
        const {
            Count: count,
        } = await documentClient.scan({
            TableName: DYNAMO_TABLE_VPP_CONFIGURATION,
            Select: 'COUNT',
        }).promise();
        vppCount = count;
    });
    describe('invoked with a callback', () => {
        const callback = jest.fn();
        beforeAll(async () => {
            await configClient.iterateOverVPPs({
                handler: callback,
            });
        });
        it('should invoke that callback for each vpp', () => {
            expect(callback.mock.calls.length).toEqual(vppCount);
        });
        it('should have called the callback for the integration-tests vpp', () => {
            const vppIds = callback.mock.calls.map(args => args[0].vppId);
            expect(vppIds).toContain(TEST_VPP);
        });
    });
});