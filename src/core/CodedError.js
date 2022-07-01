const { logger } = require('../logger');

class CodedError extends Error {
    constructor(description, {
        statusCode = 500,
        nrSilenced = false,
        details = null,
        userMessage = null,
    } = {}) {
        super();
        this.name = this.constructor.name;
        this.description = description;
        this.statusCode = statusCode;
        this.nrSilenced = nrSilenced;
        this.details = details;
        this.userMessage = userMessage;
    }

    toString() {
        return JSON.stringify({
            ...this,
            stack: this.stack,
        });
    }

    // for backward compatibility
    asResponseStatus() {
        return {
            message: this.message,
            name: this.name,
            statusCode: this.statusCode,
        };
    }

    get status() {
        logger.warn('CodedError.status is deprecated. Used CodedError.statusCode instead', this);
        return this.statusCode;
    }

    get isPetError() {
        return true;
    }

    get message() {
        const message = {
            statusCode: this.statusCode,
            description: this.description,
        };
        if (this.userMessage) {
            message.userMessage = this.userMessage;
        }
        if (this.details) {
            message.details = this.details;
        }
        return JSON.stringify(message);
    }
}

module.exports = {
    CodedError,
};
