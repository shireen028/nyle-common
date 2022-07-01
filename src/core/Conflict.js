const {
    CodedError,
} = require('./CodedError');

class Conflict extends CodedError {
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
            userMessage = null;
        }
        super(systemMessage, {
            ...context,
            statusCode: 409,
            userMessage,
        });
        // backwards compatibility
        this.user = {
            message: userMessage,
            name: this.name,
        };
    }
}

module.exports = {
    Conflict,
};
