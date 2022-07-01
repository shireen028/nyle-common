function createLocalLambda({
    handler,
    functionName,
}) {
    if (typeof handler !== 'function') {
        throw new Error('need the lambda handler');
    }
    if (typeof functionName !== 'string') {
        throw new Error('Must pass function name');
    }

    const invoke = (payload) => new Promise((resolve, reject) => {
        handler(payload, { functionName }, (err, res) => {
            if (err) {
                // eslint-disable-next-line prefer-promise-reject-errors
                return void reject({
                    errorType: err.name,
                    errorMessage: err.message,
                    ...err,
                });
            }
            resolve(res);
        });
    });

    return {
        invoke,
        invokeAsync: invoke,
    };
}

module.exports = {
    createLocalLambda,
};
