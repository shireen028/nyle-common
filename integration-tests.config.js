const config = require('./jest.config');

config.testMatch = ['<rootDir>/integration-tests/**/*.test.js'];

module.exports = config;
