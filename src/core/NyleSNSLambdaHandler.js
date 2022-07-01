const { NyleLambdaHandler } = require('./NyleLambdaHandler');

class NyleSNSLambdaHandler extends NyleLambdaHandler {
    getRequestId(event, awsContext) {
        const {
            awsRequestId,
        } = awsContext;
        if (!event.Records || !event.Records[0]) return awsRequestId;
        const [record] = event.Records;
        if (!record.Sns || !record.Sns.Message) return awsRequestId;
        try {
            const message = JSON.parse(record.Sns.Message);
            return message.requestId || awsRequestId;
        } catch (err) {
            return awsRequestId;
        }
    }
}

module.exports = {
    NyleSNSLambdaHandler,
};
