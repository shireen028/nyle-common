const {
    NyleLambda,
} = require('../aws');

/**
 * Returns a client for a lambda parameterized by service name and handler name
 * @param {object} params Lambda parameters
 * @param {string} params.service Name of service of which this lambda is a part
 * @param {string} params.handler Name of this lambda's handler
 * @returns {class} LambdaClient({ stage }) constructor
 */
function lambdaClientFactory({
    service,
    handler,
}) {
    const LambdaClient = getLambdaClientConstructor({
        service,
        handler,
    });
    return proxyClientConstructor(LambdaClient);
}

function getLambdaClientConstructor({
    service,
    handler,
}) {
    return function LambdaClient({
        stage,
    }) {
        const lambda = new NyleLambda({
            name: `${service}-${stage}-${handler}`,
        });

        Object.defineProperty(this, '_lambda', {
            writable: false,
            value: lambda,
        });
    };
}

function proxyClientConstructor(LambdaClient) {
    return new Proxy(LambdaClient, {
        construct(_, args) {
            const client = new LambdaClient(...args);
            return proxyClientMethods(client);
        },
    });
}

function proxyClientMethods(client) {
    return new Proxy(client, {
        get(target, eventType) {
            return (eventProps, context) => {
                const event = (eventType === 'invoke') ? eventProps : Object.assign(eventProps, {
                    type: eventType,
                });
                return target._lambda.invoke(event, context);
            };
        },
    });
}

module.exports = {
    lambdaClientFactory,
};
