const {
    CodedError,
} = require('./CodedError');

class InternalError extends CodedError {
    constructor(message, context = {}) {
        super(message, {
            ...context,
            statusCode: 500,
        });
    }
}

module.exports = {
    InternalError,
};
