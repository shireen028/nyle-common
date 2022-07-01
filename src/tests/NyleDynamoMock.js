class NyleDynamoMock {
    constructor({ table }) {
        this.table = table;
        this.get = jest.fn(() => Promise.resolve());
        this.update = jest.fn(() => Promise.resolve());
        this.put = jest.fn(() => Promise.resolve());
        this.delete = jest.fn(() => Promise.resolve());
        this.batchWrite = jest.fn(() => Promise.resolve());
        this.query = jest.fn(() => Promise.resolve({ results: [] }));
        this.scan = jest.fn(() => Promise.resolve({ results: [] }));
    }
}

module.exports = {
    NyleDynamoMock,
};
