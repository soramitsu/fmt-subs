module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  globals: {
    es2020: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/src/**/*.spec.ts', '**/src/**/__tests__/*.ts'],
      env: {
        jest: true,
      },
    },
  ],
}
