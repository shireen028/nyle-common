const {
    BadParameters,
} = require('../core/BadParameters');
const Logger = require('./Logger');

describe('Logger', () => {
    let consoleMock;
    let logger;
    beforeEach(() => {
        consoleMock = {
            log: jest.fn(),
            error: jest.fn(),
        };
        logger = new Logger({
            console: consoleMock,
        });
    });
    describe('LOG_LEVEL=WARN', () => {
        beforeEach(() => {
            logger.setLogLevel('warn');
        });
        describe('logger.error', () => {
            it('should write to consoleMock.error', () => {
                logger.error('testing');
                expect(consoleMock.error).toHaveBeenCalled();
                expect(consoleMock.log).not.toHaveBeenCalled();
            });
            describe('when invoked with an error that that is an instance of CodedError', () => {
                it('should stringify the error', () => {
                    const err = new BadParameters('message');
                    logger.error(err);
                    expectLastNArgsToHaveBeen(consoleMock.error, JSON.stringify(err));
                });
            });
            describe('when invoked with an error that that is not an instance of CodedError', () => {
                it('should log error directly', () => {
                    const err = new Error('message');
                    logger.error(err);
                    expectLastNArgsToHaveBeen(consoleMock.error, err);
                });
            });
            describe('when invoked with an object that fails to stringify', () => {
                it('should log the object directly', () => {
                    const o = {
                        toJSON() {
                            throw new Error('Message');
                        },
                    };
                    logger.error(o);
                    expectLastNArgsToHaveBeen(consoleMock.error, o);
                });
            });
            describe('when invoked with a function argument that fails to execute properly', () => {
                it('should log the error', () => {
                    logger.error(() => { throw new Error('Message'); });
                    expectLastNArgsToHaveBeen(consoleMock.error, '[ function argument failed to execute - Error: Message ]');
                });
            });
        });
        describe('logger.warn', () => {
            describe('when invoked with one function argument', () => {
                it('should invoke that function, logging the return value', () => {
                    const expectedLog = 'warning';
                    logger.warn(() => expectedLog);
                    expectLastNArgsToHaveBeen(consoleMock.log, expectedLog);
                });
            });
            describe('when invoked with a function as the 2nd argument', () => {
                it('should invoke that function, passing any of the succeeding arguments as parameters to that function', () => {
                    const tag = 'TAG';
                    const otherArgs = [1, 2, 3];
                    logger.warn(tag, () => otherArgs.reduce((m, n) => m + n, 0), ...otherArgs);
                    expectLastNArgsToHaveBeen(consoleMock.log, tag, 6);
                });
            });
        });
        describe('logger.info', () => {
            it('should not call function argumentone function argument as 2nd argument and subsequent arguments', () => {
                const argFn = jest.fn();
                logger.info(argFn);
                expect(argFn).not.toHaveBeenCalled();
            });
        });
    });
});

function expectLastNArgsToHaveBeen(mockedFn, ...expectedArgs) {
    const allArgs = mockedFn.mock.calls[0];
    const lastNArgs = allArgs.slice(allArgs.length - expectedArgs.length);
    expect(lastNArgs).toEqual(expectedArgs);
}
