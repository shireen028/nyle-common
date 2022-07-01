let newrelic;
try {
    // eslint-disable-next-line global-require, import/no-unresolved
    newrelic = require('newrelic');
} catch (err) {
    newrelic = null;
}

function withNewRelic(newRelicMethod) {
    if (!newrelic) return () => {};
    return (...args) => newRelicMethod(...args);
}

function addCustomAttribute(key, value) {
    newrelic.addCustomAttribute(key, value);
}

function addCustomAttributes(attrs) {
    newrelic.addCustomAttributes(attrs);
}

function noticeError(error) {
    newrelic.noticeError(error);
}

module.exports = {
    addCustomAttribute: withNewRelic(addCustomAttribute),
    addCustomAttributes: withNewRelic(addCustomAttributes),
    noticeError: withNewRelic(noticeError),
};
