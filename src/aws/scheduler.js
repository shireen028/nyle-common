const { AWS } = require('./aws');

const cloudwatchevents = new AWS.CloudWatchEvents();

/*
 * Schedules an event and sends a payload to a queue
 * Note that the interface to a queue is pretty loose - so
 * in fact it might be directly to a lambda
 */
function Scheduler() {
    this.schedule = ({
        at,
        name,
        queueData,
        queueName,
    }) => {
        const cron = `cron(${timestampToCron(at)})`;
        return Promise.resolve()
            .then(() => {
                if (at <= Date.now()) {
                    throw new Error(`you cannot schedule something in the past at: ${at}`);
                }
            })
            .then(() => cloudwatchevents.putRule({
                Name: name,
                ScheduleExpression: cron,
                State: 'ENABLED',
            }).promise())
            .then(() => {
                const queueDataAsJSON = JSON.stringify(queueData);

                if (!queueDataAsJSON || queueDataAsJSON.length === 0) {
                    throw new Error('queueData is required');
                }

                return putTargets(name, queueName, queueDataAsJSON);
            })
            .then((response) => ({ arn: response.RuleArn }));
    };

    this.reschedule = (event) => {
        if (!event.name || !event.at) {
            throw new Error('name and at are required');
        }
        const cron = `cron(${timestampToCron(event.at)})`;
        return cloudwatchevents.describeRule({ Name: event.name }).promise()
            .then((rule) => cloudwatchevents.putRule({
                Name: rule.Name,
                ScheduleExpression: cron,
                State: rule.State,
            }).promise());
    };

    this.getRuleNamesByPrefix = (prefix) => cloudwatchevents.listRules({
        NamePrefix: prefix,
    }).promise().then((response) => response.Rules.map((rule) => rule.Name));

    this.delete = (event) => cloudwatchevents.listTargetsByRule({ Rule: event.name }).promise()
        .then((response) => {
            if (response.Targets.length > 0) {
                const ids = response.Targets.map((t) => t.Id);
                return cloudwatchevents.removeTargets({
                    Ids: ids,
                    Rule: event.name,
                }).promise();
            }
            return null;
        })
        .then(() => cloudwatchevents.deleteRule({ Name: event.name }).promise());
}

function putTargets(ruleName, arn, input) {
    return cloudwatchevents.putTargets({
        Rule: ruleName,
        Targets: [{
            Id: `${ruleName}.1`,
            Arn: arn,
            Input: input,
        }],
    }).promise().then((putTargetsResponse) => {
        if (putTargetsResponse.FailedEntryCount > 0) {
            throw putTargetsResponse;
        } else {
            return putTargetsResponse;
        }
    });
}

function timestampToCron(timestamp) {
    const date = new Date(timestamp);
    const minute = date.getUTCMinutes();
    const hour = date.getUTCHours();
    const dayOfMonth = date.getUTCDate();
    const monthOfYear = date.getUTCMonth() + 1;
    const dayOfWeek = '?';
    const year = date.getUTCFullYear();
    return `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek} ${year}`;
}

module.exports = {
    Scheduler,
};
