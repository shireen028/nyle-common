const {
    CodedError,
} = require('./CodedError');

class BadParameters extends CodedError {
    constructor(message, context = {}) {
        super(message, {
            ...context,
            statusCode: 400,
        });
    }
}

module.exports = {
    BadParameters,
};
