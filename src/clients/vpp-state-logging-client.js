const {
    NyleLambda,
} = require('../aws');

class VPPStateLoggingClient {
    constructor({
        stage,
    }) {
        const stats = new NyleLambda({
            name: `vpp-state-logging-${stage}-stats`,
        });
        Object.defineProperties(this, {
            stats: {
                value: stats,
                writable: false,
            },
        });
    }

    getStatsForLastDay({ vppId }) {
        return this.stats.invoke({
            type: 'describe',
            payload: {
                vpp: vppId,
            },
        });
    }
}

module.exports = {
    VPPStateLoggingClient,
};
