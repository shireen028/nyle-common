const {
    AWS,
} = require('./aws');
const {
    RequestContext,
} = require('../core/request-context');

const RAMP_CREATION_STATUS_INVALID_REQUEST = 'invalid-request';
const RAMP_CREATION_STATUS_PENDING = 'pending';
const RAMP_CREATION_STATUS_SERVER_ERROR = 'error';
const RAMP_CREATION_STATUS_SUCCESS = 'success';

class StepFunctionInterface {
    constructor({ arn }) {
        const stepFunctionClient = new AWS.StepFunctions({
            apiVersion: '2016-11-23',
        });

        async function trigger(input, name = null) {
            const params = {
                stateMachineArn: arn,
                input: JSON.stringify(RequestContext.wrapEvent(input)),
            };
            if (name) params.name = name;
            const {
                executionArn,
            } = await stepFunctionClient.startExecution(params).promise();
            await pollUntilReady(async () => {
                const rampCreationStatus = await checkRampCreationStatus(executionArn);
                switch (rampCreationStatus) {
                    case RAMP_CREATION_STATUS_SUCCESS: return { status: 200 };
                    case RAMP_CREATION_STATUS_INVALID_REQUEST: return { status: 400 };
                    case RAMP_CREATION_STATUS_SERVER_ERROR: return { status: 500 };
                    default: return null;
                }
            });
            return executionArn;
        }

        async function cancel(executionId) {
            await stepFunctionClient.stopExecution({
                executionArn: getExecutionArnFromId(executionId),
            }).promise();
        }

        Object.defineProperties(this, {
            cancel: {
                value: cancel,
                writable: false,
            },
            trigger: {
                value: trigger,
                writable: false,
            },
        });

        function getExecutionArnFromId(executionId) {
            const arnParts = arn.split('stateMachine');
            return `${arnParts[0]}execution${arnParts[1]}:${executionId}`;
        }

        async function checkRampCreationStatus(executionArn) {
            const {
                events,
            } = await stepFunctionClient.getExecutionHistory({
                executionArn,
            }).promise();

            let tasksBegun = 0;
            for (let i = 0; i < events.length; i += 1) {
                const event = events[i];
                const eventType = event.type;
                if (eventType === 'TaskStateEntered') {
                    // two TaskStateEntered events means that the call to
                    // createRamp was successful
                    tasksBegun += 1;
                    if (tasksBegun >= 2) return RAMP_CREATION_STATUS_SUCCESS;
                } else if (eventType === 'FailStateEntered') {
                    // a failure state entered means the call failed
                    if (event.stateEnteredEventDetails.name === 'InvalidRequest') return RAMP_CREATION_STATUS_INVALID_REQUEST;
                    return RAMP_CREATION_STATUS_SERVER_ERROR;
                }
            }

            return RAMP_CREATION_STATUS_PENDING;
        }
    }
}

function pollUntilReady(isReady) {
    return new Promise((resolve) => {
        const timeout = Date.now() + (3 * 1000);
        function wait() {
            setTimeout(async () => {
                if (Date.now() > timeout) {
                    return resolve({ status: 200 });
                }
                const res = await isReady();
                if (res) return resolve(res);
                wait();
                return null;
            }, 200);
        }
        wait();
    });
}

module.exports = {
    StepFunctionInterface,
};
