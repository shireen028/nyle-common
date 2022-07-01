const {
    BadParameters,
} = require('../core');
const {
    AWS,
} = require('./aws');
const { logger } = require('../logger');

const fetchSecretsFromSSM = async (..._keys) => {
    let options = _keys[_keys.length - 1];
    let keys = _keys;
    if (typeof options === 'string') {
        options = {};
    } else {
        keys = _keys.slice(0, _keys.length - 1);
    }
    const client = new AWS.SSM();
    const res = await client.getParameters({
        Names: keys,
        WithDecryption: !!options.decrypt,
    }).promise();
    if (res.InvalidParameters.length > 0) {
        const message = `Could not fetch the following parameters from SSM: ${res.InvalidParameters.join(', ')}`;
        if (options.throw) {
            throw new BadParameters(message);
        } else {
            logger.warn(message);
        }
    }
    return res.Parameters.reduce((memo, p) => ({
        ...memo,
        [p.Name]: p.Value,
    }), {});
};

module.exports = {
    fetchSecretsFromSSM,
};

if (require.main === module) {
    (async () => {
        try {
            const res = await fetchSecretsFromSSM('AURORA_MASTER_PASSWORD', 'OTHER');
            logger.log(res);
        } catch (err) {
            logger.error(err);
        }
    })();
}
