const {
    AWS,
} = require('./aws');
const {
    BadParameters,
    RequestContext,
    LambdaClientError,
} = require('../core');

const {
    STAGE,
} = process.env;

class NyleLambda {
    constructor({
        name: _name = null,
        service = null,
        handler = null,
        client: _client = null,
    }) {
        let name;
        if (_name) {
            name = _name;
        } else if (service && handler) {
            name = `${service}-${STAGE}-${handler}`;
        } else {
            throw new BadParameters('Expected either name or both service and handler to be defined');
        }

        const client = _client || new AWS.Lambda();

        const _invoke = async (_payload, async = false) => {
            const payload = RequestContext.wrapEvent(_payload);
            const res = await client.invoke({
                FunctionName: name,
                InvocationType: async ? 'Event' : 'RequestResponse',
                LogType: 'None',
                Payload: JSON.stringify(payload),
            }).promise();
            const responsePayload = res.Payload ? JSON.parse(res.Payload) : null;
            if (responsePayload && responsePayload.errorMessage) {
                let err;
                try {
                    err = new LambdaClientError(name, responsePayload);
                } catch (_) {
                    err = responsePayload;
                }
                throw err;
            }
            return responsePayload;
        };

        Object.defineProperties(this, {
            name: {
                get: () => name,
            },
            invoke: {
                value: (payload) => _invoke(payload),
                writable: true,
            },
            invokeAsync: {
                value: (payload) => _invoke(payload, true),
                writable: false,
            },
        });
    }
}

module.exports = {
    NyleLambda,
};
