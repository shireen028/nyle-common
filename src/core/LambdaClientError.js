const {
    CodedError,
} = require('./CodedError');

class LambdaClientError extends CodedError {
    constructor(lambda, error, context = {}) {
        const {
            errorType = '<UnknownError>',
            errorMessage = 'default',
        } = error;
        let statusCode = 500;
        try {
            const underlyingError = JSON.parse(errorMessage);
            // eslint-disable-next-line prefer-destructuring
            if (underlyingError.statusCode) statusCode = underlyingError.statusCode;
        } catch (_) {
            // pass
        }
        super(`${errorType} when invoking ${lambda}`, {
            ...context,
            statusCode,
            details: errorMessage,
        });
    }
}

module.exports = {
    LambdaClientError,
};
