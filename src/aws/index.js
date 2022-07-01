const { AWS } = require('./aws');
const { NyleLambda } = require('./NyleLambda');
const { NyleDynamo } = require('./NyleDynamo');
const { NyleSNS } = require('./NyleSNS');
const { NyleS3 } = require('./NyleS3');
const { NyleRole } = require('./NyleRole');
const { decryptEnvVar } = require('./decrypt-env-var');
const {
    pushMetric,
    pushMetricOnLambdaInit,
} = require('./cloudwatch');
const {
    Scheduler,
} = require('./scheduler');
const {
    StepFunctionInterface,
} = require('./step-function-interface');
const {
    fetchSecretsFromSSM,
} = require('./ssm');
const {
    SafeLambda,
} = require('./safe-lambda');

module.exports = {
    NyleLambda,
    NyleDynamo,
    NyleSNS,
    NyleS3,
    NyleRole,
    decryptEnvVar,
    CloudWatchEvents: AWS.CloudWatchEvents,
    pushMetric,
    pushMetricOnLambdaInit,
    Scheduler,
    AWS,
    StepFunctionInterface,
    fetchSecretsFromSSM,
    SafeLambda,
};

module.exports.setRegion = (region) => {
    AWS.config.update({ region });
};
