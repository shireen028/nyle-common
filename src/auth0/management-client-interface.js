const {
    ManagementClient,
} = require('auth0');
const {
    decryptEnvVar,
} = require('../aws');

let client;

const DEFAULT_SCOPE = 'read:users read:users_app_metadata';

async function getManagementClient({
    clientSecret,
    clientId,
    domain,
    audience,
    scope = DEFAULT_SCOPE,
}) {
    if (client) return client;
    // decryptEnvVar is the "old" way of doing things, look at
    // fetchSecretsFromSSM if you need a current example of how to pull things
    // from ssm!
    const decryptedSecret = await decryptEnvVar(clientSecret);
    client = new ManagementClient({
        domain,
        clientId,
        clientSecret: decryptedSecret,
        scope,
        audience,
        tokenProvider: {
            enableCache: true,
            cacheTTLInSeconds: 10,
        },
    });
    return client;
}

class ManagementClientInterface {
    constructor({
        domain,
        clientId,
        clientSecret,
        audience,
    }) {
        Object.defineProperty(this, 'client', {
            value: getManagementClient({
                domain,
                clientId,
                clientSecret,
                audience,
            }),
            writable: false,
        });
    }

    getUser(...args) {
        return this.client.then((c) => c.getUser(...args));
    }

    updateUserMetadata(...args) {
        return this.client.then((c) => c.updateUserMetadata(...args));
    }

    updateAppMetadata(...args) {
        return this.client.then((c) => c.updateAppMetadata(...args));
    }

    getUsersByEmail(...args) {
        return this.client.then((c) => c.getUsersByEmail(...args));
    }
}

module.exports = {
    ManagementClientInterface,
};
