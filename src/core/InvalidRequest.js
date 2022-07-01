const {
    CodedError,
} = require('./CodedError');

class InvalidRequest extends CodedError {
    constructor(description, context = {}) {
        let userMessage;
        let systemMessage;
        // backwards compatibility
        if (typeof description === 'object') {
            /* eslint-disable prefer-destructuring */
            userMessage = description.userMessage;
            systemMessage = description.systemMessage;
            /* eslint-enable */
        } else {
            systemMessage = description;
        }
        super(systemMessage || userMessage, {
            ...context,
            userMessage,
            statusCode: 400,
        });
        // backwards compatibility
        this.user = {
            message: userMessage,
            name: this.name,
        };
    }
}

module.exports = {
    InvalidRequest,
};
