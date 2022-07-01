const {
    escape,
} = require('mysql');
const {
    BadParameters,
} = require('../core/BadParameters');

const COL_TYPE_JSON = 'json';
const COL_TYPE_BINARY_UUID = 'binaryUuid';

function getObservationConverter(columns) {
    return function observationToTuple(observation) {
        const values = columns.map((col) => {
            let val = observation[col.key];
            if (val == null) {
                if (col.nullable) return 'NULL';
                throw new BadParameters(`Missing non-nullable value ${col.key}`);
            } else if (col.type === COL_TYPE_JSON) {
                val = JSON.stringify(val);
            } else if (col.type === COL_TYPE_BINARY_UUID) {
                return `UNHEX(REPLACE(${escape(val)}, '-', ''))`;
            }
            return escape(val);
        });
        return `(${values.join(',')})`;
    };
}

function formatInsertQuery({
    columns,
    tablename,
    observations,
    overwrite = true,
}) {
    const observationsAsTuples = observations.map(getObservationConverter(columns));
    const insert = `
    INSERT INTO ${tablename} (${columns.map((c) => c.key).join(', ')}) VALUES
    ${observationsAsTuples.join(', ')}
    `;
    if (!overwrite) return [`${insert};`];
    const update = `
    ${columns.filter((c) => !c.index).map((c) => `${c.key}=VALUES(${c.key})`).join(', ')}
    `;
    return [`${insert} ON DUPLICATE KEY UPDATE ${update};`];
}

module.exports = {
    formatInsertQuery,
    getObservationConverter,
};
