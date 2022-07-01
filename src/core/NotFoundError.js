const {
    CodedError,
} = require('./CodedError');

class NotFoundError extends CodedError {
    constructor(message, context = {}) {
        super(message, {
            ...context,
            statusCode: 404,
        });
    }
}

module.exports = {
    NotFoundError,
};
