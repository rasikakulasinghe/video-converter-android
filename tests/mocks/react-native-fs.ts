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

// CommonJS style export - primary for Node.js/Jest
module.exports = mockFS;

// Add individual properties to module.exports for namespace-style access
// This is critical for TypeScript's generated namespace imports like react_native_fs_1.default
module.exports.default = mockFS;
module.exports.exists = mockFS.exists;
module.exports.readFile = mockFS.readFile;
module.exports.writeFile = mockFS.writeFile;
module.exports.unlink = mockFS.unlink;
module.exports.mkdir = mockFS.mkdir;
module.exports.copyFile = mockFS.copyFile;
module.exports.moveFile = mockFS.moveFile;
module.exports.stat = mockFS.stat;
module.exports.getFSInfo = mockFS.getFSInfo;
module.exports.readDir = mockFS.readDir;
module.exports.readdir = mockFS.readdir;
module.exports.DocumentDirectoryPath = mockFS.DocumentDirectoryPath;
module.exports.TemporaryDirectoryPath = mockFS.TemporaryDirectoryPath;
module.exports.CachesDirectoryPath = mockFS.CachesDirectoryPath;
module.exports.ExternalDirectoryPath = mockFS.ExternalDirectoryPath;
module.exports.ExternalStorageDirectoryPath = mockFS.ExternalStorageDirectoryPath;
module.exports.PicturesDirectoryPath = mockFS.PicturesDirectoryPath;
module.exports.MoviesDirectoryPath = mockFS.MoviesDirectoryPath;
module.exports.DownloadDirectoryPath = mockFS.DownloadDirectoryPath;

// Named exports for ES6 destructuring imports
export const exists = mockFS.exists;
export const readFile = mockFS.readFile;
export const writeFile = mockFS.writeFile;
export const unlink = mockFS.unlink;
export const mkdir = mockFS.mkdir;
export const copyFile = mockFS.copyFile;
export const moveFile = mockFS.moveFile;
export const stat = mockFS.stat;
export const getFSInfo = mockFS.getFSInfo;
export const readDir = mockFS.readDir;
export const readdir = mockFS.readdir;
export const DocumentDirectoryPath = mockFS.DocumentDirectoryPath;
export const TemporaryDirectoryPath = mockFS.TemporaryDirectoryPath;
export const CachesDirectoryPath = mockFS.CachesDirectoryPath;
export const ExternalDirectoryPath = mockFS.ExternalDirectoryPath;
export const ExternalStorageDirectoryPath = mockFS.ExternalStorageDirectoryPath;
export const PicturesDirectoryPath = mockFS.PicturesDirectoryPath;
export const MoviesDirectoryPath = mockFS.MoviesDirectoryPath;
export const DownloadDirectoryPath = mockFS.DownloadDirectoryPath;

// Default export for ES6 default imports
export default mockFS;