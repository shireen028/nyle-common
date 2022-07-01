const assert = require('assert');

const {
    SafeLambda,
} = require('./safe-lambda');

describe('SafeLambda#invoke', () => {
    let lambda;
    let safeLambda;
    beforeEach(() => {
        lambda = {
            invoke: jest.fn(),
        };
        safeLambda = new SafeLambda({
            lambda,
            maxPayloadSizeKiB: 1,
        });
    });
    describe('when invoked with a payload less than `maxPayloadSizeKB`', () => {
        beforeEach(async () => {
            const payload = makePayload({
                kb: 0.5,
            });
            const payloadSize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
            assert(payloadSize < 1024);
            await safeLambda.invoke({
                type: 'event-type',
                payload,
            });
        });
        it('should invoke the wrapped lambda once', () => {
            expect(lambda.invoke).toHaveBeenCalledTimes(1);
        });
    });
    describe('when invoked with a payload between 2 and 3 times `maxPayloadSizeKB`', () => {
        beforeEach(async () => {
            const payload = makePayload({
                kb: 2.3,
            });
            const payloadSize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
            assert(payloadSize > 2024);
            assert(payloadSize < 3036);
            await safeLambda.invoke({
                type: 'event-type',
                payload,
            });
        });
        it('should invoke the wrapped lambda 3 times', () => {
            expect(lambda.invoke).toHaveBeenCalledTimes(3);
        });
    });
    describe('when invoked with a payload between 5 and 6 times `maxPayloadSizeKB`', () => {
        beforeEach(async () => {
            const payload = makePayload({
                kb: 5.5,
            });
            const payloadSize = Buffer.byteLength(JSON.stringify(payload), 'utf8');
            assert(payloadSize > 5 * 1024);
            assert(payloadSize < 6 * 1024);
            await safeLambda.invoke({
                type: 'event-type',
                payload,
            });
        });
        it('should invoke the wrapped lambda 6 times', () => {
            expect(lambda.invoke).toHaveBeenCalledTimes(6);
        });
    });
    describe('when invoked with a payload that would trigger the stack overflow in cloud-backend#893', () => {
        beforeEach(async () => {
            const payload = makePayload({
                // cloud-backend#893 was caused by an event with payload 24370 bytes,
                // invoked on a SafeLambda instance with a maximum payload size of 6 KiB.
                // This scales that event size down so as to trigger a similar recursion
                // for SafeLambda instance with a maximum payload size of 1 KiB.
                kb: 24370 / 1024 / 6,
            });
            await safeLambda.invoke({
                type: 'event-type',
                payload,
            });
        });
        it('should return', () => {
            expect(lambda.invoke).toHaveBeenCalled();
        });
    });
});

function makePayload({
    kb,
}) {
    const l = ((kb * 1024) - 1) / 2;
    return Array.from({
        length: Math.ceil(l),
    }).map(() => 1);
}
