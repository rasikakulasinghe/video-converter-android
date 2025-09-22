// Fast ESLint configuration for development
module.exports = {
  extends: ['expo'],
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Keep only critical rules for speed
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.d.ts',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};