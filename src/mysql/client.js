const {
    createConnection,
} = require('mysql');
const { logger } = require('../logger');
const { BadInput } = require('./BadInput');

class MySQLClient {
    constructor({
        host,
        user,
        password,
        database,
        connection = null,
        allowMultipleStatements = false,
    }) {
        const _connection = connection || createConnection({
            host,
            user,
            password,
            database,
            multipleStatements: allowMultipleStatements,
        });

        Object.defineProperty(this, 'connection', {
            enumerable: false,
            writable: false,
            value: _connection,
        });

        Object.defineProperty(this, 'closeConnection', {
            enumerable: false,
            writable: false,
            value: () => _connection.end(),
        });

        this.database = database;
    }

    query(query, values = null) {
        const args = [query];
        if (values) args.push(values);
        return new Promise((resolve, reject) => {
            const handler = (err, res) => { // eslint-disable-line consistent-return
                if (err) return reject(err);
                resolve(res);
            };
            args.push(handler);
            const req = this.connection.query(...args);
            logger.debug('MySQLClient query SQL:', req.sql);
        });
    }

    // by design, these errors are not handled in the query method,
    // but exposed for children to handle as they see fit
    get errors() {
        return {
            BadInput,
        };
    }
}

module.exports = {
    MySQLClient,
    createConnection,
};
