/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  setupFiles: ['./jest.env.setup.ts'], // ✅ for dotenv only
  setupFilesAfterEnv: ['./jest.setup.ts'], // ✅ for your beforeEach/afterEach logging
};
