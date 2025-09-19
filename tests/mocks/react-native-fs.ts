/**
 * Mock for react-native-fs
 */

const mockFS = {
  // File system operations
  exists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockResolvedValue('mock-file-content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  moveFile: jest.fn().mockResolvedValue(undefined),
  
  // File stats
  stat: jest.fn().mockResolvedValue({
    size: 1024 * 1024, // 1MB
    isFile: () => true,
    isDirectory: () => false,
    mtime: new Date(),
    ctime: new Date(),
  }),
  
  // File system info - critical for FFmpegVideoProcessor.validateRequest
  getFSInfo: jest.fn().mockResolvedValue({
    totalSpace: 64 * 1024 * 1024 * 1024, // 64GB
    freeSpace: 32 * 1024 * 1024 * 1024,  // 32GB available
  }),
  
  // Directory operations
  readDir: jest.fn().mockResolvedValue([]),
  readdir: jest.fn().mockResolvedValue([]),
  
  // Path constants
  DocumentDirectoryPath: '/mock/documents',
  TemporaryDirectoryPath: '/mock/temp',
  CachesDirectoryPath: '/mock/cache',
  ExternalDirectoryPath: '/mock/external',
  ExternalStorageDirectoryPath: '/mock/external-storage',
  PicturesDirectoryPath: '/mock/pictures',
  MoviesDirectoryPath: '/mock/movies',
  DownloadDirectoryPath: '/mock/downloads',
};

// ES module style default export for TypeScript 
export default mockFS;

// CommonJS style export - for Node.js/Jest compatibility
module.exports = mockFS;

// Ensure default property exists on module.exports
module.exports.default = mockFS;