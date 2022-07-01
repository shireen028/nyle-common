const fs = require('fs');
const path = require('path');

const uuidv4 = require('uuid/v4');

const {
    NyleLambdaHandler,
    NyleSNSLambdaHandler,
    NyleSQSLambdaHandler,
} = require('./lambda');
const {
    RequestContext,
} = require('./request-context');

describe('NyleLambdaHandler', () => {
    describe('given a wrapped lambda handler that relies on the request ID', () => {
        let foundRequestId;
        let handler;
        beforeEach(() => {
            handler = new NyleLambdaHandler();
            handler.handler = () => {
                foundRequestId = RequestContext.getRequestId();
            };
        });
        describe('when invoked without an explicit requestId', () => {
            beforeEach(async () => {
                await handler.handleEvent({}, {}, () => {});
            });
            it('should find the generated request ID', () => {
                expect(foundRequestId).toBeDefined();
            });
            testRequestContextCleared();
        });
        describe('when invoked with a requestId in the event object', () => {
            const requestId = uuidv4();
            beforeEach(async () => {
                await handler.handleEvent({
                    requestId,
                }, {}, () => {});
            });
            it('should find the event\'s request ID', () => {
                expect(foundRequestId).toEqual(requestId);
            });
            testRequestContextCleared();
        });
        describe('when invoked with an awsRequestId in the context object', () => {
            const awsRequestId = uuidv4();
            beforeEach(async () => {
                await handler.handleEvent({}, {
                    awsRequestId,
                }, () => {});
            });
            it('should find the AWS request ID', () => {
                expect(foundRequestId).toEqual(awsRequestId);
            });
            testRequestContextCleared();
        });
    });
});

describe('NyleSNSLambdaHandler', () => {
    describe('given a wrapped lambda handler that relies on the request ID', () => {
        let foundRequestId;
        let handler;
        beforeEach(() => {
            handler = new NyleSNSLambdaHandler();
            handler.handler = () => {
                foundRequestId = RequestContext.getRequestId();
            };
        });
        describe('when invoked without an explicit requestId', () => {
            beforeEach(async () => {
                await handler.handleEvent(loadFixture('sns-without-request-id'), {}, () => {});
            });
            it('should find the generated request ID', () => {
                expect(foundRequestId).toBeDefined();
            });
            testRequestContextCleared();
        });
        describe('when invoked with a requestId in the SNS message', () => {
            beforeEach(async () => {
                await handler.handleEvent(loadFixture('sns-with-request-id'), {}, () => {});
            });
            it('should find the generated request ID', () => {
                expect(foundRequestId).toEqual('sns-request-id');
            });
            testRequestContextCleared();
        });
    });
});

describe('NyleSQSLambdaHandler', () => {
    describe('given a wrapped lambda handler that relies on the request ID', () => {
        let foundRequestId;
        let handler;
        beforeEach(() => {
            handler = new NyleSQSLambdaHandler();
            handler.handler = () => {
                foundRequestId = RequestContext.getRequestId();
            };
        });
        describe('when invoked without an explicit requestId', () => {
            beforeEach(async () => {
                await handler.handleEvent(loadFixture('sqs-without-request-id'), {}, () => {});
            });
            it('should find the generated request ID', () => {
                expect(foundRequestId).toBeDefined();
            });
            testRequestContextCleared();
        });
        describe('when invoked with a requestId in the SNS message', () => {
            beforeEach(async () => {
                await handler.handleEvent(loadFixture('sqs-with-request-id'), {}, () => {});
            });
            it('should find the generated request ID', () => {
                expect(foundRequestId).toEqual('sqs-request-id');
            });
            testRequestContextCleared();
        });
    });
});

function testRequestContextCleared() {
    test('the request context should be cleared after the invocation', () => {
        const requestId = RequestContext.getRequestId();
        expect(requestId).toBeNull();
    });
}

function loadFixture(fixture) {
    const p = path.join(
        __dirname,
        '__fixtures__',
        `${fixture}.json`,
    );
    return JSON.parse(fs.readFileSync(p), {
        encoding: 'utf-8',
    });
}
