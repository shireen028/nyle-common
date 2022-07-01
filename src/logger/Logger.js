const theConsole = console;

class Logger {
    constructor({
        console = theConsole,
        timestamp = () => (new Date()).toISOString(),
    } = {}) {
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            SILENT: 4,
        };
        let currentLevel = this.levels.WARN;
        const shouldLog = (level) => (this.levels[level] || 0) >= currentLevel;

        this.setLogLevel = (level) => {
            if (!level) {
                currentLevel = 0;
            } else if (Number.isInteger(level)) {
                currentLevel = level;
            } else {
                currentLevel = this.levels[level.toUpperCase ? level.toUpperCase() : level] || 0;
            }
        };

        const prepareForLogging = (args) => {
            const rv = [];
            let ix = 0;
            while (ix < args.length) {
                const arg = args[ix];
                switch (typeof arg) {
                    case 'function': {
                        try {
                            rv.push(arg(...args.slice(ix + 1)));
                        } catch (err) {
                            rv.push(`[ function argument failed to execute - ${err} ]`);
                        }
                        ix = args.length;
                        break;
                    }
                    case 'object': {
                        if (arg instanceof Error && !arg.isPetError) {
                            rv.push(arg);
                            break;
                        }
                        try {
                            rv.push(JSON.stringify(arg));
                        } catch (err) {
                            rv.push(arg);
                        }
                        break;
                    }
                    default: {
                        rv.push(arg);
                    }
                }
                // eslint-disable-next-line no-plusplus
                ix++;
            }
            return rv;
        };

        this.log = async (level, ...toLog) => {
            if (!shouldLog(level)) return;
            try {
                /* eslint-disable no-console */
                const logFn = this.levels[level] === this.levels.ERROR
                    ? console.error
                    : console.log;
                /* eslint-enable */
                logFn(level, '-', timestamp(), '-', ...prepareForLogging(toLog));
            } catch (e) {
                // we failed to log, we could do nothing, but let's at
                // least warn so it is known that we are not logging correctly
                // be very careful here ...
                // could create a stack overflow
                // and we're supposed to just be logging,
                // we don't want to bubble errors up to the app
                console.error('failed to log', e);
            }
        };

        this.debug = (...args) => {
            this.log('DEBUG', ...args);
        };

        this.info = (...args) => {
            this.log('INFO', ...args);
        };

        this.warn = (...args) => {
            this.log('WARN', ...args);
        };

        this.error = (...args) => {
            this.log('ERROR', ...args);
        };
    }
}

module.exports = Logger;

if (require.main === module) {
    /* eslint-disable no-console */
    try {
        const logger = new Logger();
        logger.setLogLevel('INFO');
        logger.info('Message');
        logger.error('An error', {
            message: 'laksjd',
        });
        logger.error(() => 'A function call');
        logger.error((...args) => `A function call with args: ${args.join(', ')}`, 'arg1', 'arg2');
        logger.info(() => {
            console.log('\nWhat is 2 + 2?');
            return '2 + 2 = 4\n';
        });
        logger.warn('Should see a solved arithmetic problem above this message');
    } catch (err) {
        console.error(err);
    }
}
