const moment = require('moment-timezone');

const {
    BadParameters,
} = require('../core/BadParameters');

class CSVFormatter {
    constructor({
        headers,
        dateFormat = 'YYYY-MM-DD',
        timeFormat = 'HH:mm:ss.SSS',
        tz = 'UTC',
        timestampField = null,
        timestamps = [],
        mediaType = 'text/csv',
        mediaTypeNamespace = 'data',
    } = {}) {
        if (!headers) throw new BadParameters('CSVFormatter class must be initiatized with headers');
        this.headers = headers;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.tz = tz;
        this.timestampField = timestampField;
        this.timestamps = timestamps;
        this.mediaType = mediaType;
        Object.defineProperties(this, {
            nyleMediaType: {
                get() { return `application/nyle.${mediaTypeNamespace}+csv`; },
            },
        });
    }

    format(body) {
        const csvArray = [[
            ...(
                this.timestampField ? [
                    `Date (${this.tz})`,
                    `Time (${this.tz})`,
                ] : []
            ),
            ...this.headers,
        ]];
        body.forEach((item) => {
            csvArray.push(this.formatItem(item));
        });
        return csvArray.map((fields) => fields.join(',')).join('\n');
    }

    formatItem(item) {
        if (this.timestampField) {
            const dateTime = moment.tz(item[this.timestampField], this.tz);
            return [
                dateTime.format(this.dateFormat),
                dateTime.format(this.timeFormat),
                ...this.headers.map((h) => this.formatValue(item, h)),
            ];
        }
        return this.headers.map((h) => this.formatValue(item, h));
    }

    formatValue(item, key) {
        const v = item[key];
        if (typeof v === 'undefined') {
            return '';
        }
        if (this.timestamps.indexOf(key) > -1) {
            try {
                const dateTime = moment.tz(v, this.tz);
                return dateTime.format(`${this.dateFormat}T${this.timeFormat}Z`);
            } catch (err) {
                return v;
            }
        }
        return v;
    }
}

module.exports = {
    CSVFormatter,
};
