const {
    BadParameters,
} = require('../core');

const ONE_MINUTE_MS = 1000 * 60;
const FIVE_MINUTE_MS = ONE_MINUTE_MS * 5;
const ONE_HOUR_MS = FIVE_MINUTE_MS * 12;
const ONE_DAY_MS = ONE_HOUR_MS * 24;

function getIntervalFloor(interval, timestamp) {
    return Math.floor(timestamp / interval) * interval;
}

function getIntervalCeiling(interval, timestamp) {
    return Math.ceil(timestamp / interval) * interval;
}

function getIntervalMS(interval) {
    switch (interval) {
        case 'one-minute': return ONE_MINUTE_MS;
        case 'five-minutes': return ONE_MINUTE_MS * 5;
        case 'fifteen-minutes': return ONE_MINUTE_MS * 15;
        case 'one-hour':
        case 'sixty-minutes': return ONE_HOUR_MS;
        case 'one-day': return ONE_DAY_MS;
        default: throw new BadParameters(`Unknown interval '${interval}'. Use 'five-minutes', 'fifteen-minutes', 'sixty-minutes' or 'one-day'.`);
    }
}

module.exports = {
    getIntervalFloor,
    getIntervalCeiling,
    getIntervalMS,
};
