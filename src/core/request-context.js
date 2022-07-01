const uuidv4 = require('uuid/v4');

const IS_TEST = !!process.env.IS_TEST;

const {
    getRequestId,
    setRequestId,
    clearRequestId,
} = (() => {
    let requestId = null;
    return {
        getRequestId() {
            return requestId;
        },
        setRequestId(newRequestId) {
            if (requestId) throw new Error('Tried to overwrite existing request context');
            requestId = newRequestId || uuidv4();
        },
        clearRequestId() {
            requestId = null;
        },
    };
})();

const {
    getIsTest,
    setIsTest,
    clearIsTest,
} = (() => {
    let __test = false;
    return {
        getIsTest() {
            return IS_TEST || __test;
        },
        setIsTest(val) {
            __test = !!val;
        },
        clearIsTest() {
            __test = false;
        },
    };
})();

class RequestContext {
    static getRequestId() {
        return getRequestId();
    }

    static setRequestId(requestId) {
        setRequestId(requestId);
    }

    static getIsTest() {
        return getIsTest();
    }

    static setIsTest(__test) {
        setIsTest(__test);
    }

    static clear() {
        clearRequestId();
        clearIsTest();
    }

    static async withRequestId(requestId, handler) {
        setRequestId(requestId);
        await handler().catch();
        clearRequestId();
    }

    static async withRequestContext({
        requestId,
        __test = false,
    }, handler) {
        setRequestId(requestId);
        setIsTest(__test);
        await handler().catch();
        RequestContext.clear();
    }

    /* eslint-disable no-param-reassign */
    static wrapEvent(event) {
        if (typeof event !== 'object') return event;
        if (getIsTest()) event.__test = true;
        if (!event.requestId && getRequestId()) {
            event.requestId = getRequestId();
        }
        return event;
    }
    /* eslint-enable */
}

module.exports = {
    RequestContext,
};
