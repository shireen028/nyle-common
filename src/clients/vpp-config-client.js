const {
    AWS,
} = require('../aws');
const {
    BadParameters,
} = require('../core');

class VPPConfigClient {
    constructor({
        tableName,
    }) {
        if (!tableName) throw new BadParameters('Missing tableName parameter');
        Object.defineProperties(this, {
            tableName: {
                value: tableName,
                writable: false,
            },
            client: {
                value: new AWS.DynamoDB.DocumentClient(),
                writable: false,
            },
        });
    }

    async iterateOverVPPs({
        handler,
        filter = null,
    }) {
        const scanParams = buildScanParams({
            tableName: this.tableName,
            filter,
        });
        const iteration = async () => {
            const {
                Items: items,
                LastEvaluatedKey: next,
            } = await this.client.scan(scanParams).promise();
            await Promise.all(items.map((vpp) => handler(vpp)));
            return next;
        };

        let shouldContinue = true;
        while (shouldContinue) {
            const next = await iteration();
            if (!next) {
                shouldContinue = false;
                break;
            }
            scanParams.ExclusiveStartKey = next;
        }
    }
}

function buildScanParams({
    tableName,
    filter,
}) {
    const scanParams = {
        TableName: tableName,
    };
    if (filter) {
        const exprAttrValues = filter.reduce(
            (acc, vppId, ix) => Object.assign(acc, {
                [`:${ix}`]: vppId,
            }),
            {},
        );
        scanParams.FilterExpression = `vppId IN (${Object.keys(exprAttrValues).join(',')})`;
        scanParams.ExpressionAttributeValues = exprAttrValues;
    }
    return scanParams;
}

module.exports = {
    VPPConfigClient,
};
