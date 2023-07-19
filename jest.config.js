module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['esbuild-jest', { sourcemap: true, target: 'es2020' }],
  },
  testMatch: ['**/src/**/*.spec.ts', '**/src/**/__tests__/**/*.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageReporters: ['lcov'],
  coveragePathIgnorePatterns: ['node_modules/', 'coverage/'],
}
