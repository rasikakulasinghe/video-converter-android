// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getBatteryLevel: jest.fn(() => Promise.resolve(0.8)),
  getTotalMemory: jest.fn(() => Promise.resolve(8000000000)),
  getUsedMemory: jest.fn(() => Promise.resolve(4000000000)),
  getPowerState: jest.fn(() => Promise.resolve({
    batteryLevel: 0.8,
    batteryState: 'unplugged',
    lowPowerMode: false,
  })),
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  PicturesDirectoryPath: '/mock/pictures',
  ExternalDirectoryPath: '/mock/external',
  exists: jest.fn(() => Promise.resolve(true)),
  readDir: jest.fn(() => Promise.resolve([])),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  unlink: jest.fn(() => Promise.resolve()),
  copyFile: jest.fn(() => Promise.resolve()),
  stat: jest.fn(() => Promise.resolve({ size: 1000, mtime: new Date() })),
}));

// Mock ffmpeg-kit-react-native
jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: {
    execute: jest.fn(() => Promise.resolve({ getReturnCode: () => 0 })),
    executeAsync: jest.fn(() => Promise.resolve()),
    cancel: jest.fn(() => Promise.resolve()),
  },
  ReturnCode: {
    SUCCESS: 0,
    CANCEL: 255,
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