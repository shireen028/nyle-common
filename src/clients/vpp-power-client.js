const {
    NyleLambda,
} = require('../aws');

class VPPPowerClient {
    constructor({
        prefix,
    }) {
        const coreHandler = new NyleLambda({
            name: `${prefix}-core`,
        });
        const setpointsHandler = new NyleLambda({
            name: `${prefix}-adjust-setpoints`,
        });
        const dataHandler = new NyleLambda({
            name: `${prefix}-fetch-state`,
        });
        const calculateSetPointsHandler = new NyleLambda({
            name: `${prefix}-calculate-setpoints`,
        });

        Object.defineProperties(this, {
            coreHandler: {
                value: coreHandler,
                writable: false,
            },
            setpointsHandler: {
                value: setpointsHandler,
                writable: false,
            },
            dataHandler: {
                value: dataHandler,
                writable: false,
            },
            calculateSetPointsHandler: {
                value: calculateSetPointsHandler,
                writable: false,
            },
        });
    }

    vppDevicePowerChanged() {
        this.coreHandler.invokeAsync({
            type: 'vppDevicePowerChanged',
        });
    }

    computePower() {
        this.coreHandler.invokeAsync({
            type: 'computePower',
        });
    }

    getPower(params) {
        return this.coreHandler.invoke({
            ...params,
            type: 'getPower',
        });
    }

    setTargetPower(params) {
        return this.setpointsHandler.invoke({
            ...params,
            type: 'setTargetPower',
        });
    }

    setMode(params) {
        return this.setpointsHandler.invoke({
            ...params,
            type: 'setMode',
        });
    }

    incrementRamp(params) {
        return this.setpointsHandler.invoke({
            ...params,
            type: 'incrementRamp',
        });
    }

    createRamp(params) {
        return this.setpointsHandler.invoke({
            ...params,
            type: 'createRamp',
        });
    }

    rampTargetPower(params) {
        return this.setpointsHandler.invoke({
            ...params,
            type: 'rampTargetPower',
        });
    }

    getState(params) {
        return this.dataHandler.invoke({
            ...params,
            type: 'getState',
        });
    }

    getSetPoints(params) {
        return this.dataHandler.invoke({
            ...params,
            type: 'getSetPoints',
        });
    }

    calculateSetPoints(event) {
        return this.calculateSetPointsHandler.invoke(event);
    }
}

module.exports = {
    VPPPowerClient,
};
