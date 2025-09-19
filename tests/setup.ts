// Jest setup for React Native Video Converter Android App

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock React Native using external mock
jest.mock('react-native');

// Mock React Native FS - Inline to avoid circular dependency
jest.mock('react-native-fs', () => ({
  exists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue('mock-file-content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  moveFile: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({
    size: 1024 * 1024,
    isFile: () => true,
    isDirectory: () => false,
    mtime: new Date(),
  }),
  readDir: jest.fn().mockResolvedValue([
    {
      name: 'test-video.mp4',
      path: '/mock/path/test-video.mp4',
      size: 10485760,
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
    },
  ]),
  DownloadDirectoryPath: '/mock/download',
  DocumentDirectoryPath: '/mock/documents',
  ExternalDirectoryPath: '/mock/external',
  ExternalStorageDirectoryPath: '/mock/external-storage',
  TemporaryDirectoryPath: '/mock/temp',
  LibraryDirectoryPath: '/mock/library',
  PicturesDirectoryPath: '/mock/pictures',
  CachesDirectoryPath: '/mock/caches',
  MainBundlePath: '/mock/bundle',
  downloadFile: jest.fn().mockResolvedValue({ promise: Promise.resolve() }),
  default: {}
}));

// Mock FFmpeg Kit React Native - Inline to avoid circular dependency
let pendingConversions: any[] = [];

jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: {
    execute: jest.fn().mockResolvedValue({
      getReturnCode: () => Promise.resolve({ getValue: () => 0 }),
      getState: () => Promise.resolve('completed'),
      getDuration: () => Promise.resolve(30000),
      getOutput: () => Promise.resolve('FFmpeg output'),
      getFailStackTrace: () => Promise.resolve(''),
    }),
    executeAsync: jest.fn((command, completeCallback, logCallback, statisticsCallback) => {
      // Create a session that can be controlled
      const session = {
        getReturnCode: () => Promise.resolve({ getValue: () => 0 }),
        getState: () => Promise.resolve('running'),
        cancel: jest.fn(() => {
          session.getState = () => Promise.resolve('cancelled');
          if (completeCallback) {
            completeCallback(session);
          }
        }),
      };

      // Store pending conversion so tests can control completion
      pendingConversions.push({ session, completeCallback, statisticsCallback });

      // Simulate statistics updates
      setTimeout(() => {
        if (statisticsCallback) {
          statisticsCallback({ 
            getTime: () => 1000, 
            getVideoFrameNumber: () => 100,
            getSpeed: () => 1.0,
            getSize: () => 1024 * 1024,
            getBitrate: () => 1000000
          });
        }
      }, 50);

      return Promise.resolve(session);
    }),
    cancel: jest.fn().mockResolvedValue(undefined),
    list: jest.fn().mockResolvedValue([]),
  },
  FFmpegKitConfig: {
    enableLogCallback: jest.fn(),
    enableStatisticsCallback: jest.fn(),
    setLogLevel: jest.fn(),
  },
  ReturnCode: {
    SUCCESS: { getValue: () => 0 },
    CANCEL: { getValue: () => 255 },
    isSuccess: (returnCode: any) => returnCode?.getValue() === 0,
    isCancel: (returnCode: any) => returnCode?.getValue() === 255,
  },
  Level: {
    AV_LOG_QUIET: 0,
    AV_LOG_INFO: 32,
    AV_LOG_ERROR: 16,
  },
  SessionState: {
    CREATED: 'created',
    RUNNING: 'running',
    FAILED: 'failed',
    COMPLETED: 'completed',
  },
  default: {},

  // Expose helper for tests
  __testHelpers: {
    completePendingConversions: () => {
      pendingConversions.forEach(({ session, completeCallback }) => {
        session.getState = () => Promise.resolve('completed');
        if (completeCallback) {
          completeCallback(session);
        }
      });
      pendingConversions = [];
    },
    cancelPendingConversions: () => {
      pendingConversions.forEach(({ session, completeCallback }) => {
        session.cancel();
      });
      pendingConversions = [];
    },
    getPendingConversionsCount: () => pendingConversions.length,
  }
}));// Mock react-native-device-info
jest.mock('react-native-device-info', () => {
  // Create mock functions that always resolve successfully
  const createSuccessMock = (value: any) => jest.fn().mockResolvedValue(value);
  
  const mockDeviceInfo = {
    // Battery methods
    getBatteryLevel: createSuccessMock(0.8),
    isBatteryCharging: createSuccessMock(false),
    
    // Memory methods  
    getTotalMemory: createSuccessMock(8000000000),
    getUsedMemory: createSuccessMock(4000000000),
    
    // Storage methods
    getTotalDiskCapacity: createSuccessMock(64000000000),
    getFreeDiskStorage: createSuccessMock(32000000000),
    
    // Thermal methods
    getThermalState: createSuccessMock('nominal'),
    
    // Power state methods
    getPowerState: createSuccessMock({
      batteryLevel: 0.8,
      batteryState: 'unplugged',
      lowPowerMode: false,
      batteryOptimizationEnabled: false,
    }),
    
    // Device info methods
    getDeviceId: createSuccessMock('mock-device-id'),
    getManufacturer: createSuccessMock('Mock Manufacturer'),
    getModel: createSuccessMock('Mock Model'),
    getSystemVersion: createSuccessMock('11'),
    getApiLevel: createSuccessMock(30),
    getAvailableLocationProviders: createSuccessMock({}),
    getDeviceName: createSuccessMock('Mock Device'),
    getUniqueId: createSuccessMock('mock-unique-id'),
  };

  // Return the mock with both default and named export support
  return {
    __esModule: true,
    default: mockDeviceInfo,
    ...mockDeviceInfo,
  };
});

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