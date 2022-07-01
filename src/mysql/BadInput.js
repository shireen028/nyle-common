const {
    CodedError,
} = require('../core');

class BadInput extends CodedError {
    constructor(message) {
        super(message, 400);
    }
}

module.exports = {
    BadInput,
};
