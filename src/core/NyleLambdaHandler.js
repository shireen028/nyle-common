const {
    CodedError,
} = require('./CodedError');
const {
    addCustomAttribute,
} = require('../newrelic');
const { logger } = require('../logger');
const {
    RequestContext,
} = require('./request-context');

class NyleLambdaHandler {
    constructor({
        usage = null,
    } = {}) {
        this.usage = usage;
    }

    async handler() {
        throw new CodedError('This method must either be overriden in a subclass or by doing NyleLambdaHandler.handler = handler ...');
    }

    getRequestId(event, awsContext) {
        if (event && event.requestId) return event.requestId;
        if (awsContext && awsContext.awsRequestId) return awsContext.awsRequestId;
        return null;
    }

    getIsTest(event) {
        return !!event.__test;
    }

    handleEvent(event, awsContext, callback) {
        if (!awsContext.logger) {
            // eslint-disable-next-line no-param-reassign
            awsContext.logger = logger;
        }
        const requestId = this.getRequestId(event, awsContext);
        const __test = this.getIsTest(event);
        RequestContext.withRequestContext({
            requestId,
            __test,
        }, async () => {
            if (event.type === 'help') {
                return void callback(null, {
                    usage: this.usage,
                });
            }
            addCustomAttribute('requestId', requestId);
            awsContext.logger.info('Lambda invoked with event', () => {
                try {
                    return JSON.stringify(event);
                } catch (err) {
                    return event;
                }
            });
            try {
                const res = await this.handler(event, awsContext);
                return void callback(null, res);
            } catch (err) {
                // note that you can also silence a whole class of errors
                // using the `expected_classes` configuration value.
                // See https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration#error_config
                if (err.nrSilenced || __test) addCustomAttribute('errorSilenced', true);
                // No need to log the whole error:
                // This is done natively in both AWS lambda and locally with serverless
                const logMessage = `${err.name}: ${err.logMessage || err.message}. Event:`;
                awsContext.logger.error(logMessage, event);
                return void callback(err);
            }
        });
    }
}

function toNyleLambdaHandler(handler, {
    usage = null,
} = {}) {
    const nyleLambdaHandler = new NyleLambdaHandler({
        usage,
    });
    nyleLambdaHandler.handler = handler;
    return nyleLambdaHandler.handleEvent.bind(nyleLambdaHandler);
}

module.exports = {
    NyleLambdaHandler,
    toNyleLambdaHandler,
};
