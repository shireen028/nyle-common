const {
    AWS,
} = require('./aws');

class NyleSNS {
    constructor({
        topicArn,
        prettyPrint = false,
    }) {
        Object.defineProperties(this, {
            topicArn: {
                value: topicArn,
                writable: false,
            },
            prettyPrint: {
                value: Boolean(prettyPrint),
                writable: false,
            },
            snsClient: {
                value: new AWS.SNS(),
                writable: false,
            },
        });
    }

    prepareMessage(message) {
        if (typeof message === 'string') {
            return message;
        }

        if (this.prettyPrint) {
            return JSON.stringify(message, null, 2);
        }

        return JSON.stringify(message);
    }

    publish({
        Message,
        Subject,
        MessageAttributes,
    }) {
        return this.snsClient.publish({
            TopicArn: this.topicArn,
            Message: this.prepareMessage(Message),
            Subject,
            MessageAttributes,
        }).promise();
    }
}

module.exports = {
    NyleSNS,
};
