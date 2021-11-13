module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['esbuild-jest', { sourcemap: true, target: 'es2020' }],
  },
  testMatch: ['**/src/**/*.spec.ts', '**/src/**/__tests__/**/*.ts'],
}
