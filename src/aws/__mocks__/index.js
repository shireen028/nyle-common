let __mockInvoke = null;

class NyleLambda {
    invoke(...args) {
        if (__mockInvoke) return __mockInvoke(...args);
        return null;
    }
}

function setMockInvoke(fn) {
    __mockInvoke = fn;
}

module.exports = {
    setMockInvoke,
    NyleLambda,
};
