const {
    createConnection,
} = require('mysql');
const {
    decryptEnvVar,
} = require('../aws');

const {
    RDSDB_CLUSTER_AURORA_MASTER_ADDRESS,
    AURORA_MASTER_PASSWORD,
    AURORA_MASTER_USERNAME,
    STAGE,
    USE_ENCRYPTED_RDS_PASSWORD,
} = process.env;

const getDecryptedPassword = (() => {
    let decryptedPassword;
    return async (password = AURORA_MASTER_PASSWORD) => {
        if (decryptedPassword) return decryptedPassword;
        if (useEncryptedRDSPassword()) {
            decryptedPassword = await decryptEnvVar(password);
        } else {
            decryptedPassword = password;
        }
        return decryptedPassword;
    };
})();

// TODO: cloud-backend#269
// We only encrypt the master password on production
// See https://github.com/packetizedenergy/cloud-backend/issues/269
// and grep for cloud-backend#269 for other instances in this codebase where this matters.
//
// decryptEnvVar is the "old" way of doing things, look at
// fetchSecretsFromSSM if you need a current example of how to pull things
// from ssm!
function useEncryptedRDSPassword() {
    return STAGE === 'prod' || STAGE === 'nyle' || USE_ENCRYPTED_RDS_PASSWORD === 'true';
}

async function createDatabaseConnection(database) {
    const connectionParams = {
        host: RDSDB_CLUSTER_AURORA_MASTER_ADDRESS,
        user: AURORA_MASTER_USERNAME,
        password: await getDecryptedPassword(),
        database,
    };
    return createConnection(connectionParams);
}

module.exports = {
    createDatabaseConnection,
    getDecryptedPassword,
    useEncryptedRDSPassword,
};
