jest.mock('../aws');

const {
    setMockInvoke,
} = require('../aws');

const {
    lambdaClientFactory,
} = require('./lambda-client-factory');

describe('lambdaClientFactory', () => {
    describe('given a LambdaClient created with lambdaClientFactory', () => {
        let LambdaClient;
        beforeAll(() => {
            LambdaClient = lambdaClientFactory({
                service: 'a-service',
                handler: 'handler',
            });
        });
        describe('given an instance of LambdaClient', () => {
            let client;
            beforeEach(() => {
                client = new LambdaClient({
                    stage: 'dev',
                });
            });
            test('<instance> instanceof LambdaClient should be true', () => {
                expect(client).toBeInstanceOf(LambdaClient);
            });
            describe('when aMethod is invoked on the client', () => {
                let aMethod;
                beforeEach(() => {
                    aMethod = jest.fn();
                    setMockInvoke(aMethod);
                    client.aMethod({ paramKey: 1 });
                });
                it('should call a lambda with an event type equal to that method\'s name', () => {
                    const aMethodsReceivedArgs = aMethod.mock.calls[0];
                    expect(aMethodsReceivedArgs[0]).toEqual({
                        type: 'aMethod',
                        paramKey: 1,
                    });
                });
            });
            describe('when the invoke method is called on the client', () => {
                const eventType = 'event-type';
                let invoke;
                beforeEach(() => {
                    invoke = jest.fn();
                    setMockInvoke(invoke);
                    client.invoke({
                        type: eventType,
                        paramKey: 1,
                    });
                });
                it('should delegate directly to the invoke method', () => {
                    const invokesReceivedArgs = invoke.mock.calls[0];
                    expect(invokesReceivedArgs[0]).toEqual({
                        type: eventType,
                        paramKey: 1,
                    });
                });
            });
        });
    });
});
