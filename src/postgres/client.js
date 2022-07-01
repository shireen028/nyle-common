const { Pool } = require('pg');
const { logger } = require('../logger');
const { BadParameters } = require('../core');

class PostgresClient {
    constructor({
        host,
        user,
        password,
        database,
        connection = null,
    }) {
        const _connection = connection || new Pool({
            host,
            user,
            password,
            database,
            port: 5432,
        });

        Object.defineProperty(this, 'connection', {
            enumerable: false,
            writable: false,
            value: _connection,
        });

        Object.defineProperty(this, 'closeConnection', {
            enumerable: false,
            writable: false,
            value: () => _connection.end(() => {
                logger.info('connection closed');
            }),
        });

        this.database = database;
    }

    async query(text, values) {
        const start = Date.now();
        const res = await this.connection.query(text, values);
        const duration = Date.now() - start;
        logger.debug('Postgres Query:', {
            text,
            duration,
            rows: res.rowCount,
        });
        return res;
    }

    // by design, these errors are not handled in the query method,
    // but exposed for children to handle as they see fit
    get errors() {
        return {
            BadParameters,
        };
    }
}

module.exports = {
    PostgresClient,
};
