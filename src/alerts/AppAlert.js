const {
    CodedError,
} = require('../core');

class AppAlert extends CodedError {
    constructor(alert) {
        super(alert.name, {
            details: alert.description,
        });
    }
}

module.exports = {
    AppAlert,
};
