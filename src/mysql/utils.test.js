const {
    escape,
} = require('mysql');
const {
    BadParameters,
} = require('../core/BadParameters');

const {
    getObservationConverter,
} = require('./utils');

describe('getObersvationConverter', () => {
    describe('given a nullable column', () => {
        const cols = [
            {
                key: 'key',
                type: 'number',
                nullable: true,
            },
        ];
        it('should treat null as NULL', () => {
            expect(getObservationConverter(cols)({
                key: null,
            })).toEqual('(NULL)');
        });
        it('should treat missing values as NULL', () => {
            expect(getObservationConverter(cols)({})).toEqual('(NULL)');
        });
        it('should return falsey but existing values as normal', () => {
            expect(getObservationConverter(cols)({
                key: 0,
            })).toEqual('(0)');
        });
    });
    describe('given a non-nullable column', () => {
        const cols = [
            {
                key: 'key',
                type: 'number',
                nullable: false,
            },
        ];
        it('should treat null as an error', () => {
            expect.assertions(1);
            try {
                getObservationConverter(cols)({
                    key: null,
                });
            } catch (err) {
                expect(err).toBeInstanceOf(BadParameters);
            }
        });
        it('should treat missing values as an error', () => {
            expect.assertions(1);
            try {
                getObservationConverter(cols)({});
            } catch (err) {
                expect(err).toBeInstanceOf(BadParameters);
            }
        });
        it('should return falsey but existing values as normal', () => {
            expect(getObservationConverter(cols)({
                key: 0,
            })).toEqual('(0)');
        });
    });
    it('should wrap string values in single quotes', () => {
        expect(getObservationConverter([
            {
                key: 'key',
                type: 'string',
                nullable: false,
            },
        ])({
            key: 'value',
        })).toEqual("('value')");
    });
    it('should stringify json values and wrap them in single quotes', () => {
        const val = [0, 'b', 2];
        expect(getObservationConverter([
            {
                key: 'key',
                type: 'json',
                nullable: false,
            },
        ])({
            key: val,
        })).toEqual(`(${escape(JSON.stringify(val))})`);
    });
    it('should wrap binaryUuid values in the MySQL UNHEX function after replacing any hyphens', () => {
        const uuid = '024f8f71-2769-4ffd-9d36-cd4052be0b12';
        expect(getObservationConverter([
            {
                key: 'key',
                type: 'binaryUuid',
            },
        ])({
            key: uuid,
        })).toEqual(`(UNHEX(REPLACE('${uuid}', '-', '')))`);
    });
});
