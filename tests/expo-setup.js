/**
 * Custom Expo setup to avoid TypeScript compilation issues with expo-modules-core
 * This replaces jest-expo/src/preset/setup.js
 */

// Define global constants that React Native expects
global.__DEV__ = true;
global.__TEST__ = true;
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

const mockNativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');

// window isn't defined as of react-native 0.45+ it seems
if (typeof window !== 'object') {
  globalThis.window = global;
  globalThis.window.navigator = {};
}

if (typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
  globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: true,
    renderers: {
      values: () => [],
    },
    on() {},
    off() {},
  };
  globalThis.window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

// Mock ImageLoader
const mockImageLoader = {
  configurable: true,
  enumerable: true,
  get: () => ({
    prefetchImage: jest.fn(),
    getSize: jest.fn((uri, success) => process.nextTick(() => success(320, 240))),
  }),
};
Object.defineProperty(mockNativeModules, 'ImageLoader', mockImageLoader);
Object.defineProperty(mockNativeModules, 'ImageViewManager', mockImageLoader);

// Mock LinkingManager
Object.defineProperty(mockNativeModules, 'LinkingManager', {
  configurable: true,
  enumerable: true,
  get: () => ({
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve()),
  }),
});

// Create simplified mock classes for Expo
class MockEventEmitter {
  addListener = jest.fn();
  removeAllListeners = jest.fn();
  removeSubscription = jest.fn();
  emit = jest.fn();
  off = jest.fn();
  on = jest.fn();
  once = jest.fn();
}

class MockNativeModule {
  constructor() {}
  static ViewPrototype = {};
}

class MockSharedObject {
  constructor() {}
}

// Setup globalThis.expo before any imports
globalThis.expo = {
  EventEmitter: MockEventEmitter,
  NativeModule: MockNativeModule,
  SharedObject: MockSharedObject,
  SharedRef: MockSharedObject,
  modules: {},
  uuidv4: jest.fn(() => 'mock-uuid-v4'),
  uuidv5: jest.fn(() => 'mock-uuid-v5'),
  getViewConfig: jest.fn(() => {
    throw new Error('Method not implemented.');
  }),
  reloadAppAsync: jest.fn(async () => {
    // Mock implementation
  }),
};

// Mock expo-modules-core completely
jest.doMock('expo-modules-core', () => {
  return {
    EventEmitter: MockEventEmitter,
    NativeModule: MockNativeModule,
    SharedObject: MockSharedObject,
    NativeModulesProxy: {},
    requireOptionalNativeModule: jest.fn(() => null),
    requireNativeModule: jest.fn(() => ({})),
    requireNativeViewManager: jest.fn(() => null),
    UnavailabilityError: class extends Error {
      constructor(moduleName, propertyName) {
        super(`${propertyName} is not available on ${moduleName}`);
      }
    },
    CodedError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
    Platform: {
      OS: 'android',
      select: jest.fn((obj) => obj.android || obj.default),
    },
    uuid: {
      v4: jest.fn(() => 'mock-uuid-v4'),
      v5: jest.fn(() => 'mock-uuid-v5'),
    },
  };
});

// Mock expo modules
const expoModules = {
  'ExpoModulesCore': {},
  'ExpoCrypto': {},
  'ExpoSecureStore': {},
  'ExpoFileSystem': {},
  'ExpoDevice': {},
  'ExpoConstants': {},
};

for (const [moduleName, moduleValue] of Object.entries(expoModules)) {
  mockNativeModules[moduleName] = moduleValue;
}