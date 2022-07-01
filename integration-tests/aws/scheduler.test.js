const AWS = require('aws-sdk');
const {
    Scheduler,
} = require('../../src/aws');

const eventsClient = new AWS.CloudWatchEvents();
const SCHEDULER_INTEGRATION_TESTS_SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:377766316057:scheduler-integration-tests';
const {
    NO_CLEAN_UP,
} = process.env;

describe('Scheduler#schedule', () => {
    let scheduler;
    beforeEach(() => {
        scheduler = new Scheduler();
    })
    describe('when scheduling an event 5 seconds in the future', () => {
        let timestamp;
        let name;
        let event;
        beforeEach(async () => {
            timestamp = Date.now() + (1000 * 60 * 2);
            name = `nyleCommon.integrationTests.${timestamp}`,
            event = {
                at: timestamp,
                name,
                queueName: SCHEDULER_INTEGRATION_TESTS_SNS_TOPIC_ARN,
                queueData: {
                    date: (new Date(timestamp)).toUTCString(),
                },
            };
            await scheduler.schedule(event);
        });
        afterEach(async () => {
            if (!NO_CLEAN_UP) await scheduler.delete(event);
        });
        it('should put the event as a cloud watch rule', async () => {
            const res = await eventsClient.describeRule({
                Name: name,
            }).promise();
            expect(res).toBeDefined();
        });
    })
});
