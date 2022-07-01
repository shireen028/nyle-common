const {
    noticeError,
} = require('../newrelic');
const {
    NyleLambda,
} = require('../aws');
const { AppAlert } = require('./AppAlert');

const { logger } = require('../logger');

class AlertHandler {
    constructor({
        stage,
    }) {
        const lambda = new NyleLambda({ name: `alert-mgr-${stage}-alert` });

        this.create = ({
            sendToNR = true,
            ...alert
        }) => {
            try {
                if (sendToNR) {
                    const err = new AppAlert(alert);
                    noticeError(err);
                }

                lambda.invokeAsync(({
                    ...alert,
                    type: 'createAlert',
                }));
            } catch (err) {
                logger.error('Alert failed', err);
            }
        };
    }
}

module.exports = {
    AlertHandler,
};
