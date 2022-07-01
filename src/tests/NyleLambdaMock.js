class NyleLambdaMock {
    constructor({ name }) {
        this.name = name;
        this.invoke = jest.fn(() => Promise.resolve());
        this.invokeAsync = jest.fn(() => Promise.resolve());
    }
}

module.exports = {
    NyleLambdaMock,
};
