const { NyleLambdaHandler } = require('./NyleLambdaHandler');

class NyleSQSLambdaHandler extends NyleLambdaHandler {
    getRequestId(event, awsContext) {
        const {
            awsRequestId,
        } = awsContext;
        if (!event.Records || !event.Records[0]) return awsRequestId;
        const [record] = event.Records;
        if (!record.body) return awsRequestId;
        try {
            const message = JSON.parse(record.body);
            return message.requestId || awsRequestId;
        } catch (err) {
            return awsRequestId;
        }
    }
}

function toNyleSQSLambdaHandler(handler, schema, {
    usage = null,
} = {}) {
    const nyleSQSLambdaHandler = new NyleSQSLambdaHandler({
        schema,
        usage,
    });
    nyleSQSLambdaHandler.handler = handler;
    return nyleSQSLambdaHandler.handleEvent.bind(nyleSQSLambdaHandler);
}

module.exports = {
    NyleSQSLambdaHandler,
    toNyleSQSLambdaHandler,
};
