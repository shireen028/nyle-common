const {
    AWS,
} = require('./aws');
const { logger } = require('../logger');
const {
    InternalError,
} = require('../core/InternalError');

function batch(arr, batchSize) {
    const copy = arr.slice();
    const batches = [];
    while (copy.length > 0) {
        batches.push(copy.splice(0, batchSize));
    }
    return batches;
}

const DYNAMO_BATCH_WRITE_SIZE = 25;
const DYNAMO_BATCH_READ_SIZE = 100;

class NyleDynamo {
    constructor({ table }) {
        const documentClient = new AWS.DynamoDB.DocumentClient();
        this.get = async (key, params = {
            ConsistentRead: false,
        }) => {
            const request = dynamoifyParams({
                Key: key,
                ...params,
            });
            logger.debug('REQUEST documentClient.get(request)', { request });
            const response = await documentClient.get(request).promise();
            logger.debug('RESPONSE documentClient.get(request)', {
                request,
                response,
            });
            return response.Item;
        };

        const iterativelyLookUp = async (params = {}, config = null, handler = null) => {
            const {
                method = 'scan',
                iterKey = null,
                iterMax = null,
                returnCountOnly = false,
            // handling destructuring here so clients can do scan(params, null, (rv) => ...)
            } = config || {};
            const request = dynamoifyParams(params);
            logger.debug(`REQUEST documentClient.${method}(request)`, { request });
            let exclusiveStartKey = iterKey ? deobfuscateExclusiveStartKey(iterKey) : null;
            let results = [];
            let count = 0;
            let iterCount = 0;

            if (returnCountOnly) {
                request.Select = 'COUNT';
            }

            // eslint-disable-next-line no-shadow
            const iteration = async (exclusiveStartKey) => {
                const iterationParams = {
                    ...request,
                    ExclusiveStartKey: exclusiveStartKey,
                };
                const result = await documentClient[method](iterationParams).promise();
                iterCount += 1;
                return {
                    result,
                    lastEvaluatedKey: result.LastEvaluatedKey,
                };
            };
            do {
                const {
                    result,
                    lastEvaluatedKey,
                    // eslint-disable-next-line no-await-in-loop
                } = await iteration(exclusiveStartKey);
                if (handler) {
                    // eslint-disable-next-line no-await-in-loop
                    await handler(result);
                } else {
                    const items = result.Items || [];
                    results = [...results, ...items];
                    count += result.Count || items.length;
                }
                exclusiveStartKey = lastEvaluatedKey;
            } while ((!iterMax || iterCount < iterMax) && exclusiveStartKey);
            logger.debug(`RESPONSE documentClient.${method}(request)`, {
                request,
                results: handler ? 'Handled with callback' : results,
            });
            return {
                iterKey: obfuscateExclusiveStartKey(exclusiveStartKey),
                results,
                count,
            };
        };

        this.update = async (params) => {
            const request = dynamoifyParams(params);
            logger.debug('REQUEST documentClient.update(request)', { request });
            const response = await documentClient.update(request).promise();
            logger.debug('RESPONSE documentClient.update(request)', {
                request,
                response,
            });
            return response;
        };

        this.put = async (item, params = {}) => {
            const request = dynamoifyParams({
                Item: item,
            }, params);
            logger.debug('REQUEST documentClient.put(request)', { request });
            const response = await documentClient.put(request).promise();
            logger.debug('RESPONSE documentClient.update(request)', {
                request,
                response,
            });
            return response;
        };

        this.delete = async (key, params = {}) => {
            const request = dynamoifyParams({ Key: key }, params);
            logger.debug('REQUEST documentClient.delete(request)', { request });
            const response = await documentClient.delete(request).promise();
            logger.debug('RESPONSE documentClient.delete(request)', {
                request,
                response,
            });
            return response;
        };

        const batchWrite = async ({
            toDelete = [],
            toPut = [],
        }) => {
            const deletions = toDelete.map((key) => ({
                DeleteRequest: {
                    Key: key,
                },
            }));
            const puts = toPut.map((item) => ({
                PutRequest: {
                    Item: item,
                },
            }));

            const batches = batch([...deletions, ...puts], DYNAMO_BATCH_WRITE_SIZE);
            const unprocessedItems = [];
            for (const writeBatch of batches) {
                const request = {
                    RequestItems: {
                        [table]: writeBatch,
                    },
                };
                logger.debug('REQUEST documentClient.batchWrite(request)', { request });
                const response = await documentClient.batchWrite(request).promise();
                logger.debug('RESPONSE documentClient.batchWrite(request)', {
                    request,
                    response,
                });

                if (response.UnprocessedItems[table] != null) {
                    unprocessedItems.push(...response.UnprocessedItems[table]);
                }
            }
            return {
                failedPuts: unprocessedItems.filter((i) => !!i.PutRequest),
                failedDeletes: unprocessedItems.filter((i) => !!i.DeleteRequest),
            };
        };

        const batchGet = async (keys) => {
            const batches = batch(keys, DYNAMO_BATCH_READ_SIZE);
            const items = [];
            for (const readBatch of batches) {
                const request = {
                    RequestItems: {
                        [table]: {
                            Keys: readBatch,
                        },
                    },
                };
                logger.debug('REQUEST documentClient.batchGet(request)', { request });
                const response = await documentClient.batchGet(request).promise();
                logger.debug('RESPONSE documentClient.batchGet(request)', {
                    request,
                    response,
                });

                items.push(...response.Responses[table]);
            }

            return items;
        };

        Object.defineProperties(this, {
            batchWrite: {
                value: batchWrite,
                writable: false,
            },
            batchGet: {
                value: batchGet,
                writable: false,
            },
            query: {
                value: (params, config = {}, handler = null) => iterativelyLookUp(params, {
                    ...config,
                    method: 'query',
                }, handler),
                writable: false,
            },
            scan: {
                value: (params, config = {}, handler = null) => iterativelyLookUp(params, {
                    ...config,
                    method: 'scan',
                }, handler),
                writable: false,
            },
        });

        function dynamoifyParams(params, otherParams) {
            if (params.attributes) {
                logger.warn('Attribute transformation using params.attributes is deprecated', {
                    ...params,
                    TableName: table,
                });
            }
            return {
                ...params,
                ...otherParams,
                TableName: table,
            };
        }
    }

    static unmarshal(ddbStreamEvent) {
        if (!ddbStreamEvent.dynamodb) throw new InternalError('Expected stream record to have dynamodb field.');
        let newData;
        let oldData;
        if (ddbStreamEvent.dynamodb.NewImage) {
            const newDataRaw = ddbStreamEvent.dynamodb.NewImage;
            newData = AWS.DynamoDB.Converter.unmarshall(newDataRaw);
        }
        if (ddbStreamEvent.dynamodb.OldImage) {
            const oldDataRaw = ddbStreamEvent.dynamodb.OldImage;
            oldData = AWS.DynamoDB.Converter.unmarshall(oldDataRaw);
        }
        return {
            newData,
            oldData,
        };
    }
}

function obfuscateExclusiveStartKey(key) {
    return key ? Buffer.from(JSON.stringify(key)).toString('base64') : null;
}

function deobfuscateExclusiveStartKey(oKey) {
    return JSON.parse(Buffer.from(oKey, 'base64').toString());
}

module.exports = {
    NyleDynamo,
};
