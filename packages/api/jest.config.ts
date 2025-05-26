import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.json' },
    },
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.(spec|test).ts'],
};

export default config;