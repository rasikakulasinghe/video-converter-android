// Global setup that runs before jest-expo setup

// Setup globalThis.expo for jest-expo compatibility
const mockEventEmitter = {
  addListener: jest.fn(),
  removeAllListeners: jest.fn(),
  removeSubscription: jest.fn(),
  emit: jest.fn(),
};

(globalThis as any).expo = {
  EventEmitter: mockEventEmitter,
  modules: {},
  NativeModulesProxy: {},
};

// Also setup global mocks that jest-expo expects
(globalThis as any).__DEV__ = true;
(globalThis as any).__TEST__ = true;