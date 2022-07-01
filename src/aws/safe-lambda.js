const {
    BadParameters,
} = require('../core/BadParameters');
const { logger } = require('../logger');

function SafeLambda({
    lambda,
    maxPayloadSizeKiB = 6,
    alertOnError = false,
    alertHandler = null,
}) {
    if (alertOnError && (!alertHandler || typeof alertHandler.create !== 'function')) {
        throw new BadParameters('Must pass an alertHandler when `alertOnError === true`');
    }
    const maxPayloadSizeBytes = maxPayloadSizeKiB * 1024;
    const invoke = async ({
        type,
        payload,
    }) => {
        if (!Array.isArray(payload)) throw new BadParameters(`Expected payload to be an (ordered) array. Got instead ${typeof payload}`);
        const eventWrapperSizeBytes = getEventSizeBytes({
            type,
            payload: '',
        });
        const payloadSizeBytes = getEventSizeBytes(payload);
        if (payloadSizeBytes + eventWrapperSizeBytes <= maxPayloadSizeBytes) {
            await lambda.invoke({
                type,
                payload,
            });
            return;
        }
        const numPartitions = Math.ceil((payloadSizeBytes + eventWrapperSizeBytes)
                                        / maxPayloadSizeBytes);
        const payloads = splitPayload({
            payload,
            numPartitions,
        });
        await payloads.reduce((chain, p) => chain.then(() => handleRecursiveInvoke({
            type,
            payload: p,
        })), Promise.resolve());
    };

    const handleRecursiveInvoke = async (...args) => {
        if (!alertOnError) {
            await invoke(...args);
            return;
        }
        try {
            await invoke(...args);
        } catch (err) {
            const tag = `Recursive safe invoke failed - ${lambda.name || 'Unknown Lambda'}`;
            logger.error(tag, err);
            alertHandler.create({
                name: tag,
            });
        }
    };

    const getEventSizeBytes = (event) => {
        const e = typeof event === 'string' ? event : JSON.stringify(event);
        return Buffer.byteLength(e, 'utf8');
    };

    const splitPayload = ({
        payload,
        numPartitions,
    }) => {
        const partitionLength = Math.floor(payload.length / numPartitions);
        const partitions = Array.from({ length: numPartitions })
            .map((_, ix) => payload.slice(ix * partitionLength, (ix + 1) * partitionLength));
        return partitions;
    };

    Object.defineProperties(this, {
        invoke: {
            value: invoke,
            writable: false,
        },
    });
}

module.exports = {
    SafeLambda,
};
