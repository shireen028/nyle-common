const Logger = require('./Logger');

const logger = new Logger();
logger.setLogLevel(logger.levels[process.env.LOG_LEVEL || 'INFO']);

module.exports = {
    logger,
};
