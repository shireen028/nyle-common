const { AWS } = require('./aws');

async function pushMetric({
    MetricName,
    Dimensions,
    StatisticValues,
    Timestamp,
    Unit,
    Value,
    namespace,
}) {
    const client = new AWS.CloudWatch();
    const metricData = {
        MetricName,
        Dimensions,
        Timestamp,
        Unit,
    };
    if (Value && StatisticValues) throw new Error('Cannot specify both Value and Statistic Values simultaneously');
    if (Value) metricData.Value = Value;
    if (StatisticValues) metricData.StatisticValues = StatisticValues;

    return client.putMetricData({
        MetricData: [
            metricData,
        ],
        Namespace: namespace ? `Nyle/${namespace}` : 'Nyle',
    }).promise();
}

function pushMetricOnLambdaInit(lambdaName) {
    return pushMetric({
        MetricName: 'LambdaInit',
        Dimensions: [
            {
                Name: 'FunctionName',
                Value: lambdaName,
            },
        ],
        Unit: 'Count',
        Value: 1,
        namespace: 'lambda',
    });
}

module.exports = {
    pushMetric,
    pushMetricOnLambdaInit,
};
