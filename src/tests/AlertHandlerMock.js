class AlertHandlerMock {
    constructor() {
        this.create = jest.fn(() => Promise.resolve());
    }
}

module.exports = {
    AlertHandlerMock,
};
