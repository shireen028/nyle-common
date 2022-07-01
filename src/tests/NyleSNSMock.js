class NyleSNSMock {
    constructor() {
        this.publish = jest.fn(() => Promise.resolve());
    }
}

module.exports = {
    NyleSNSMock,
};
