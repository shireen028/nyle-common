/*
 * Allows you to perform a test of an eventually consistent
 * system to assert that it will eventually be true
 * ```js
 * it('should eventually be true', () => {
 *      return eventually(() => checkSomething())
 * })
 * ```
 *
 * the delgate is wrapping in a promise, so it can either throw syncronously or reject
 * @param delegate {function} a function that performs the test
 * @param maxMS {number} defaults to 3s, the max amount of time before it should give up
 */
module.exports.eventually = (delegate, maxMS = 3000) => {
    const start = Date.now();
    const interval = 500;
    return new Promise((resolve, reject) => {
        const recursiveTry = () => {
            Promise.resolve()
                .then(delegate)
                .then(resolve)
                .catch((error) => {
                    if (Date.now() - start < maxMS) {
                        setTimeout(recursiveTry, interval);
                    } else {
                        reject(error);
                    }
                });
        };
        recursiveTry();
    });
};
