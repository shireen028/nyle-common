const alerts = require('./alerts');
const auth0 = require('./auth0');
const aws = require('./aws');
const clients = require('./clients');
const core = require('./core');
const csv = require('./csv');
const { logger } = require('./logger');
const Logger = require('./logger/Logger');
const performance = require('./performance');
const tests = require('./tests');
const mysql = require('./mysql');
const time = require('./time');
const schemas = require('./schemas');
const postgres = require('./postgres');

module.exports = {
    alerts,
    auth0,
    aws,
    core,
    clients,
    csv,
    logger,
    logging: {
        Logger,
    },
    performance,
    tests,
    time,
    mysql,
    schemas,
    postgres,
};
