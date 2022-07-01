const {
    ArbitrageClient,
} = require('./arbitrage-client');
const DevicePowerClient = require('./device-power-client');
const {
    LMPAnalyticsStoreClient,
} = require('./lmp-analytics-store');
const {
    VPPPowerClient,
} = require('./vpp-power-client');
const {
    lambdaClientFactory,
} = require('./lambda-client-factory');
const {
    VPPConfigClient,
} = require('./vpp-config-client');
const {
    VPPStateLoggingClient,
} = require('./vpp-state-logging-client');

module.exports = {
    ArbitrageClient,
    DevicePowerClient,
    lambdaClientFactory,
    LMPAnalyticsStoreClient,
    VPPPowerClient,
    VPPConfigClient,
    VPPStateLoggingClient,
};
