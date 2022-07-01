const { CodedError } = require('./CodedError');

describe('CodedError', () => {
    describe('.toString()', () => {
        it('should properly serialize the code and any other attributes', () => {
            const msg = 'Here is a message';
            const statusCode = 400;
            const err = new CodedError(msg, { statusCode });
            expect(JSON.parse(err.toString())).toEqual({
                name: err.name,
                description: msg,
                statusCode,
                nrSilenced: false,
                details: null,
                userMessage: null,
                stack: expect.any(String),
            });
        });
    });
});
