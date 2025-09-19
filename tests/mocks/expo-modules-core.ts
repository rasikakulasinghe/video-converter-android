// Comprehensive mock for expo-modules-core to prevent TypeScript compilation issues

// Mock classes and objects
const MockNativeModule = class {
  constructor() {}
  static ViewPrototype = {};
};

const MockEventEmitter = class {
  addListener = jest.fn();
  removeAllListeners = jest.fn();
  removeSubscription = jest.fn();
  emit = jest.fn();
  off = jest.fn();
  on = jest.fn();
  once = jest.fn();
};

const MockPlatform = {
  OS: 'android' as const,
  select: jest.fn((obj: any) => obj.android || obj.default),
};

const MockUnavailabilityError = class extends Error {
  constructor(moduleName: string, propertyName: string) {
    super(`${propertyName} is not available on ${moduleName}`);
  }
};

const MockCodedError = class extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
};

const MockRefs = {
  createRef: jest.fn(() => ({ current: null })),
};

// Create the main mock object
const mockExpoModulesCore = {
  NativeModule: MockNativeModule,
  NativeModulesProxy: {},
  EventEmitter: MockEventEmitter,
  LegacyEventEmitter: MockEventEmitter,
  Platform: MockPlatform,
  UnavailabilityError: MockUnavailabilityError,
  CodedError: MockCodedError,
  Refs: MockRefs,
  requireNativeViewManager: jest.fn(() => () => null),
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => null),
  modules: {},
  default: {},
};

// Export as default
export default mockExpoModulesCore;

// Named exports
export const NativeModule = MockNativeModule;
export const NativeModulesProxy = {};
export const EventEmitter = MockEventEmitter;
export const LegacyEventEmitter = MockEventEmitter;
export const Platform = MockPlatform;
export const UnavailabilityError = MockUnavailabilityError;
export const CodedError = MockCodedError;
export const Refs = MockRefs;
export const requireNativeViewManager = jest.fn(() => () => null);
export const requireNativeModule = jest.fn(() => ({}));
export const requireOptionalNativeModule = jest.fn(() => null);