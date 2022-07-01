const {
    lambdaClientFactory,
} = require('./lambda-client-factory');

const LMPAnalyticsStoreClient = lambdaClientFactory({
    service: 'lmp-analytics-store',
    handler: 'lmp-analytics-store',
});

module.exports = {
    LMPAnalyticsStoreClient,
};
