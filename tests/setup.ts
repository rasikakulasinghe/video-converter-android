// Jest setup for React Native Video Converter Android App

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock React Native using external mock
jest.mock('react-native');

// Mock React Native FS using external mock - Force at runtime
jest.mock('react-native-fs', () => {
  const mockFS = require('./mocks/react-native-fs.ts');
  // Ensure the mock works for all import styles
  return {
    ...mockFS,
    default: mockFS.default || mockFS,
    __esModule: true,
  };
});

// Mock FFmpeg Kit React Native using external mock - Force at runtime  
jest.mock('ffmpeg-kit-react-native', () => {
  const mockFFmpeg = require('./mocks/ffmpeg-kit-react-native.ts');
  // Ensure the mock works for all import styles
  return {
    ...mockFFmpeg,
    default: mockFFmpeg.default || mockFFmpeg,
    __esModule: true,
  };
});

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getBatteryLevel: jest.fn(() => Promise.resolve(0.8)),
  isBatteryCharging: jest.fn(() => Promise.resolve(false)),
  getTotalMemory: jest.fn(() => Promise.resolve(8000000000)),
  getUsedMemory: jest.fn(() => Promise.resolve(4000000000)),
  getTotalDiskCapacity: jest.fn(() => Promise.resolve(64000000000)),
  getFreeDiskStorage: jest.fn(() => Promise.resolve(32000000000)),
  getThermalState: jest.fn(() => Promise.resolve('nominal')),
  getPowerState: jest.fn(() => Promise.resolve({
    batteryLevel: 0.8,
    batteryState: 'unplugged',
    lowPowerMode: false,
    batteryOptimizationEnabled: false,
  })),
  getDeviceId: jest.fn(() => Promise.resolve('mock-device-id')),
  getManufacturer: jest.fn(() => Promise.resolve('Mock Manufacturer')),
  getModel: jest.fn(() => Promise.resolve('Mock Model')),
  getSystemVersion: jest.fn(() => Promise.resolve('11')),
  getApiLevel: jest.fn(() => Promise.resolve(30)),
  getAvailableLocationProviders: jest.fn(() => Promise.resolve({})),
  getDeviceName: jest.fn(() => Promise.resolve('Mock Device')),
  getUniqueId: jest.fn(() => Promise.resolve('mock-unique-id')),
  default: {
    getBatteryLevel: jest.fn(() => Promise.resolve(0.8)),
    isBatteryCharging: jest.fn(() => Promise.resolve(false)),
    getTotalMemory: jest.fn(() => Promise.resolve(8000000000)),
    getUsedMemory: jest.fn(() => Promise.resolve(4000000000)),
    getTotalDiskCapacity: jest.fn(() => Promise.resolve(64000000000)),
    getFreeDiskStorage: jest.fn(() => Promise.resolve(32000000000)),
    getThermalState: jest.fn(() => Promise.resolve('nominal')),
    getPowerState: jest.fn(() => Promise.resolve({
      batteryLevel: 0.8,
      batteryState: 'unplugged',
      lowPowerMode: false,
      batteryOptimizationEnabled: false,
    })),
    getDeviceId: jest.fn(() => Promise.resolve('mock-device-id')),
    getManufacturer: jest.fn(() => Promise.resolve('Mock Manufacturer')),
    getModel: jest.fn(() => Promise.resolve('Mock Model')),
    getSystemVersion: jest.fn(() => Promise.resolve('11')),
    getApiLevel: jest.fn(() => Promise.resolve(30)),
    getAvailableLocationProviders: jest.fn(() => Promise.resolve({})),
    getDeviceName: jest.fn(() => Promise.resolve('Mock Device')),
    getUniqueId: jest.fn(() => Promise.resolve('mock-unique-id')),
  }
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn((options, callback) => {
    // Simulate successful file selection
    const result = {
      didCancel: false,
      errorMessage: null,
      assets: [
        {
          fileName: 'test-video.mp4',
          uri: 'file:///mock/path/test-video.mp4',
          type: 'video/mp4',
          fileSize: 1024 * 1024, // 1MB
          duration: 10000, // 10 seconds
          width: 1920,
          height: 1080,
        }
      ],
    };
    
    if (callback) {
      setTimeout(() => callback(result), 100);
    }
    return Promise.resolve(result);
  }),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');