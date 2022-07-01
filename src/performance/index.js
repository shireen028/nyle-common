const { logger } = require('../logger');

module.exports.cache = (getter, maxLifeMS, staleCacheMsgBuilder) => {
    const cache = {};

    return (key) => {
        if (cache[key] && Date.now() - cache[key].at < maxLifeMS) {
            return Promise.resolve(cache[key].value);
        }
        return getter(key).then(
            (res) => {
                cache[key] = {
                    value: res,
                    at: Date.now(),
                };
                return res;
            },
            (err) => {
                if (cache[key]) {
                    logger.warn(staleCacheMsgBuilder(key, err));
                    return cache[key].value;
                }
                throw err;
            },
        );
    };
};
