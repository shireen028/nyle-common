const {
    INTEGRATION_TEST_ENV,
} = process.env;

const ARE_WE_LOCAL = INTEGRATION_TEST_ENV === 'local';

function describeIfProd(description, handler) {
    if (ARE_WE_LOCAL) {
        describe.skip(description, handler);
    } else {
        describe(description, handler);
    }
}

function describeIfLocal(description, handler) {
    if (ARE_WE_LOCAL) {
        describe(description, handler);
    } else {
        describe.skip(description, handler);
    }
}

module.exports = {
    describeIfProd,
    describeIfLocal,
};
