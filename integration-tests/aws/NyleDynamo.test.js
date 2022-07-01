const {
    DYNAMO_TABLE_DEVICES,
    DYNAMO_TABLE_VPP_STATE_HOURLY_STATS,
} = process.env;
const {
    NyleDynamo,
} = require('../../src/aws/NyleDynamo');

describe('NyleDynamo#scan', () => {
    let client;
    beforeAll(() => {
        client = new NyleDynamo({
            table: DYNAMO_TABLE_DEVICES,
        });
    });
    describe('given a query that would require mulitple scan iterations', () => {
        let params;
        beforeAll(() => {
            params = {
                Limit: 5,
            };
        });
        describe('when only iterating once', () => {
            let res;
            beforeAll(async () => {
                res = await client.scan(params, {
                    iterMax: 1,
                });
            });
            it('should return an obfustacted iteration key', () => {
                expect(res.iterKey).toBeDefined();
                const deobfuscatedKey = JSON.parse(Buffer.from(res.iterKey, 'base64').toString());
                expect(deobfuscatedKey.deviceId).toBeDefined();
            });
            describe('and when iterating again using the iterKey', () => {
                let res2;
                beforeAll(async () => {
                    res2 = await client.scan(params, {
                        iterKey: res.iterKey,
                        iterMax: 1,
                    });
                });
                it('should return a new set of results', () => {
                    expect(res).not.toEqual(res2);
                });
            });
        });
    });
    it('should allow the config parameter to be null and handle iteration with a callback', async () => {
        let handlerInvocations = 0;
        try {
            await client.scan({
                Limit: 2,
            }, null, () => {
                // eslint-disable-next-line no-plusplus
                if (++handlerInvocations > 1) throw new Error('Exiting early to avoid iterating over the entire table');
            });
        } catch (err) {
            expect(err).toBeDefined();
        }
        expect(handlerInvocations).toEqual(2);
    });
});

describe('NyleDynamo#query', () => {
    let client;
    beforeAll(() => {
        client = new NyleDynamo({
            table: DYNAMO_TABLE_VPP_STATE_HOURLY_STATS,
        });
    });
    describe('given a query that would require mulitple query iterations', () => {
        let params;
        beforeAll(() => {
            params = {
                KeyConditionExpression: 'vppId = :vppId AND hourEndingTS < :now',
                ExpressionAttributeValues: {
                    ':vppId': 'dev-vpp',
                    ':now': Date.now(),
                },
                Limit: 1,
            };
        });
        describe('when only iterating once', () => {
            let res;
            beforeAll(async () => {
                res = await client.query(params, {
                    iterMax: 1,
                });
            });
            it('should return an obfustacted iteration key', () => {
                expect(res.iterKey).toBeDefined();
                const deobfuscatedKey = JSON.parse(Buffer.from(res.iterKey, 'base64').toString());
                expect(deobfuscatedKey.vppId).toBeDefined();
                expect(deobfuscatedKey.hourEndingTS).toBeDefined();
            });
            describe('and when iterating again using the iterKey', () => {
                let res2;
                beforeAll(async () => {
                    res2 = await client.query(params, {
                        iterKey: res.iterKey,
                        iterMax: 1,
                    });
                });
                it('should return a new set of results', () => {
                    expect(res).not.toEqual(res2);
                });
            });
        });
    });
});
