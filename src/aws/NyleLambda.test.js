const {
    RequestContext,
    CodedError,
} = require('../core');
const {
    NyleLambda,
} = require('./NyleLambda');

describe('NyleLambda', () => {
    let lambda;
    let lambdaClient;
    let lambdaClientRv;
    const getClientPayload = () => {
        const [clientPayload] = lambdaClient.invoke.mock.calls[0];
        return JSON.parse(clientPayload.Payload);
    };
    beforeEach(() => {
        lambdaClientRv = {};
        lambdaClient = {
            invoke: jest.fn(() => ({ promise: () => lambdaClientRv })),
        };
        lambda = new NyleLambda({
            name: 'test',
            client: lambdaClient,
        });
    });
    afterEach(() => {
        RequestContext.clear();
    });
    describe('given that a request ID has been set globally', () => {
        beforeEach(() => {
            RequestContext.setRequestId();
        });
        describe('when invoked synchronously', () => {
            const payload = {
                type: 'sync-invocation',
            };
            it('should include that request ID in the payload', async () => {
                await lambda.invoke(payload);
                const clientPayload = getClientPayload();
                expect(clientPayload.requestId).toEqual(RequestContext.getRequestId());
            });
        });
        describe('when invoked synchronously with a custom request ID', () => {
            const payload = {
                type: 'sync-invocation',
                requestId: 'custom',
            };
            it('should include that request ID in the payload', async () => {
                await lambda.invoke(payload);
                const clientPayload = getClientPayload();
                expect(clientPayload.requestId).toEqual('custom');
            });
        });
        describe('when invoked asynchronously', () => {
            const payload = {
                type: 'async-invocation',
            };
            it('should include that request ID in the payload', async () => {
                await lambda.invokeAsync(payload);
                const clientPayload = getClientPayload();
                expect(clientPayload.requestId).toEqual(RequestContext.getRequestId());
            });
        });
    });
    describe('given that a request ID has not been set globally', () => {
        describe('when invoked synchronously', () => {
            const payload = {
                type: 'sync-invocation',
            };
            it('should not include a request ID in the payload', async () => {
                await lambda.invoke(payload);
                const clientPayload = getClientPayload();
                expect(clientPayload.requestId).toBeUndefined();
            });
        });
    });
    describe('given that this request is marked as being part of a test', () => {
        beforeEach(() => {
            RequestContext.setIsTest(true);
        });
        describe('when invoked', () => {
            const payload = {
                type: 'sync-invocation',
            };
            it('should include that request ID in the payload', async () => {
                await lambda.invoke(payload);
                const clientPayload = getClientPayload();
                expect(clientPayload.__test).toBeTruthy();
            });
        });
    });

    describe('when the underlying client errors with a subclass of CodedError', () => {
        beforeEach(() => {
            lambdaClientRv = {
                StatusCode: 200,
                FunctionError: 'Unhandled',
                ExecutedVersion: '$LATEST',
                Payload: '{"errorType":"BadParameters","errorMessage":"{\\"statusCode\\":400,\\"description\\":\\"Missing non-nullable value at\\"}","trace":["BadParameters: {\\"statusCode\\":400,\\"description\\":\\"Missing non-nullable value at\\"}","    at /var/task/node_modules/nyle-common/src/mysql/utils.js:17:23","    at Array.map (<anonymous>)","    at observationToTuple (/var/task/node_modules/nyle-common/src/mysql/utils.js:13:32)","    at Array.map (<anonymous>)","    at formatInsertQuery (/var/task/node_modules/nyle-common/src/mysql/utils.js:35:47)","    at DeviceDebugLogsClient.put (/var/task/src/clients/device-debug-logs-client.js:88:29)","    at RDSInterface.handleEvent (/var/task/src/rds-interface/index.js:140:51)","    at NyleLambdaHandler.rdsHandler [as handler] (/var/task/index.js:184:34)","    at async /var/task/node_modules/nyle-common/src/core/lambda.js:103:29","    at async Function.withRequestContext (/var/task/node_modules/nyle-common/src/core/request-context.js:78:9)"]}',
            };
        });
        it('should parse errors that look like subclasses of CodedError', async () => {
            expect.assertions(2);
            try {
                await lambda.invoke({});
            } catch (err) {
                expect(err).toBeInstanceOf(CodedError);
                expect(err.statusCode).toEqual(400);
            }
        });
    });
    describe('when the underlying client errors with an unknown error type', () => {
        beforeEach(() => {
            lambdaClientRv = {
                StatusCode: 200,
                FunctionError: 'Unhandled',
                ExecutedVersion: '$LATEST',
                Payload: '{"errorType":"TypeError","errorMessage":"Cannot read property \'map\' of undefined","trace":["TypeError: Cannot read property \'map\' of undefined","    at NyleLambdaHandler.logHandler [as handler] (/var/task/src/log-handler.js:15:60)","    at /var/task/node_modules/nyle-common/src/core/lambda.js:103:40","    at Function.withRequestContext (/var/task/node_modules/nyle-common/src/core/request-context.js:78:15)","    at NyleLambdaHandler.handleEvent (/var/task/node_modules/nyle-common/src/core/lambda.js:78:24)","    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)"]}',
            };
        });
        it('should parse errors that look like subclasses of CodedError', async () => {
            expect.assertions(2);
            try {
                await lambda.invoke({});
            } catch (err) {
                expect(err).toBeInstanceOf(CodedError);
                expect(err.statusCode).toEqual(500);
            }
        });
    });
});
