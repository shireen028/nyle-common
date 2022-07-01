const { lambdaClientFactory } = require('./lambda-client-factory');

const Client = lambdaClientFactory({
    service: 'arbitrage',
    handler: 'arbitrage',
});

class ArbitrageClient {
    constructor({ stage }) {
        const lambda = new Client({
            stage,
        });

        this.calculatePriceThresholds = ({
            priceSource,
            prices,
        }) => {
            const eventName = 'calculate-price-thresholds';
            return lambda[eventName]({
                priceSource,
                prices,
            });
        };

        this.checkPriceBin = ({
            lmp,
            priceSource,
        }) => {
            const eventName = 'check-price-bin';
            return lambda[eventName]({
                lmp,
                priceSource,
            });
        };
    }
}

module.exports = {
    ArbitrageClient,
};
