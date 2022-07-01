const { Pool } = require('pg');
const { fetchSecretsFromSSM } = require('../aws');

const createPostgresDatabaseConnection = async (database, host, user, ssmPasswordAlias) => {
    const pw = await fetchSecretsFromSSM(ssmPasswordAlias, { decrypt: true });
    const connectionParams = {
        host,
        user,
        password: pw[ssmPasswordAlias],
        database,
        port: 5432,
    };
    const pool = new Pool(connectionParams);
    return pool;
};

module.exports = {
    createPostgresDatabaseConnection,
};
