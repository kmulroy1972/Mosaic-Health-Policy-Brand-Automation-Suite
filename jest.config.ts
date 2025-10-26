import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  collectCoverage: false,
  verbose: false,
  passWithNoTests: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@mhp/shared-brand-core$': '<rootDir>/packages/shared-brand-core/src/index.ts',
    '^@mhp/shared-ui$': '<rootDir>/packages/shared-ui/src/index.ts'
  }
};

export default config;
