// Get the jest-expo preset but override the setupFiles
const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  testEnvironment: 'jsdom',
  setupFiles: [
    '<rootDir>/tests/expo-setup.js',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.test.(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Memory and performance optimizations
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    // Mock React Native components and dependencies for testing
    // NOTE: react-native is mocked in tests/setup.ts instead
    '^react-native-fs$': '<rootDir>/tests/mocks/react-native-fs.ts',
    // Mock problematic expo-modules-core entirely
    '^expo-modules-core': '<rootDir>/tests/mocks/expo-modules-core.ts',
  },
  // Add clearMocks to reset all mocks between tests
  clearMocks: true,
  // Force Jest to reset modules to ensure fresh imports
  resetModules: true,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|expo-.*|@expo|@expo/.*|react-native-.*)/)',
    // Exclude problematic expo-modules-core source files
    'node_modules/expo-modules-core/src/web/',
  ],
};