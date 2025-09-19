// Mock React Native
jest.mock('react-native', () => {
  const React = require('react');
  
  // Create React Native Testing Library compatible mock components
  const createMockComponent = (name: string) => {
    const Component = React.forwardRef((props: any, ref: any) => {
      const { children, style, onPress, disabled, testID, accessibilityRole, accessibilityLabel, accessibilityState, ...restProps } = props;
      
      // Handle different component types with proper attributes
      const elementProps: any = { ...restProps };
      
      if (testID) elementProps['data-testid'] = testID;
      if (accessibilityRole) elementProps.role = accessibilityRole;
      if (accessibilityLabel) elementProps['aria-label'] = accessibilityLabel;
      if (accessibilityState?.disabled) elementProps['aria-disabled'] = 'true';
      if (disabled) elementProps.disabled = true;
      if (onPress) elementProps.onClick = onPress;
      if (style) elementProps.style = style;
      if (ref) elementProps.ref = ref;

      return React.createElement(
        name.toLowerCase() === 'pressable' ? 'button' : name.toLowerCase(),
        elementProps,
        children
      );
    });
    Component.displayName = name;
    return Component;
  };

  return {
    Pressable: createMockComponent('Pressable'),
    Text: createMockComponent('Text'),
    TextInput: createMockComponent('TextInput'),
    View: createMockComponent('View'),
    ActivityIndicator: createMockComponent('ActivityIndicator'),
    ScrollView: createMockComponent('ScrollView'),
    Switch: createMockComponent('Switch'),
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'android',
      Version: 33,
      select: (options: any) => options.android || options.default,
      isTV: false,
      isPad: false,
      constants: {},
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
      removeEventListener: jest.fn(),
      isAvailable: true,
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
    Animated: {
      View: createMockComponent('AnimatedView'),
      Value: class {
        constructor(private _value: number) {}
        setValue(value: number) {
          this._value = value;
        }
        interpolate() {
          return 'mocked-interpolation';
        }
      },
      timing: () => ({
        start: jest.fn(),
        stop: jest.fn(),
      }),
      loop: () => ({
        start: jest.fn(),
        stop: jest.fn(),
      }),
      sequence: () => ({
        start: jest.fn(),
        stop: jest.fn(),
      }),
    },
  };
});

// Mock React Native FS
jest.mock('react-native-fs', () => ({
  default: {
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
      ctime: new Date(),
    }),
    getFSInfo: jest.fn().mockResolvedValue({
      totalSpace: 64 * 1024 * 1024 * 1024,
      freeSpace: 32 * 1024 * 1024 * 1024,
    }),
    readDir: jest.fn().mockResolvedValue([]),
    readdir: jest.fn().mockResolvedValue([]),
    DocumentDirectoryPath: '/mock/documents',
    TemporaryDirectoryPath: '/mock/temp',
    CachesDirectoryPath: '/mock/cache',
    ExternalDirectoryPath: '/mock/external',
    ExternalStorageDirectoryPath: '/mock/external-storage',
    PicturesDirectoryPath: '/mock/pictures',
    MoviesDirectoryPath: '/mock/movies',
    DownloadDirectoryPath: '/mock/downloads',
  },
  // Also provide named exports
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
    ctime: new Date(),
  }),
  getFSInfo: jest.fn().mockResolvedValue({
    totalSpace: 64 * 1024 * 1024 * 1024,
    freeSpace: 32 * 1024 * 1024 * 1024,
  }),
  readDir: jest.fn().mockResolvedValue([]),
  readdir: jest.fn().mockResolvedValue([]),
  DocumentDirectoryPath: '/mock/documents',
  TemporaryDirectoryPath: '/mock/temp',
  CachesDirectoryPath: '/mock/cache',
  ExternalDirectoryPath: '/mock/external',
  ExternalStorageDirectoryPath: '/mock/external-storage',
  PicturesDirectoryPath: '/mock/pictures',
  MoviesDirectoryPath: '/mock/movies',
  DownloadDirectoryPath: '/mock/downloads',
}));

// Mock FFmpeg Kit React Native using external mock
jest.mock('ffmpeg-kit-react-native');

// Also mock with direct inline implementation for namespace compatibility
jest.mock('ffmpeg-kit-react-native', () => {
  const mock = require('./mocks/ffmpeg-kit-react-native');
  // Make sure the mock is available as both module.exports and individual exports
  return {
    ...mock,
    default: mock,
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
    if (callback) {
      callback({
        assets: [{
          uri: '/mock/video.mp4',
          type: 'video/mp4',
          fileSize: 1000000,
          fileName: 'test-video.mp4',
        }],
      });
    }
    return Promise.resolve({
      assets: [{
        uri: '/mock/video.mp4',
        type: 'video/mp4',
        fileSize: 1000000,
        fileName: 'test-video.mp4',
      }],
    });
  }),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
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