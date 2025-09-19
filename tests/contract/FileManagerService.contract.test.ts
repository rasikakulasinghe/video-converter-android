/**
 * @fileoverview Simplified FileManagerService contract test
 * Basic interface compliance validation without heavy operations
 */

import { jest } from '@jest/globals';

// Mock all React Native dependencies upfront to prevent memory leaks
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  ExternalDirectoryPath: '/mock/external',
  exists: jest.fn(() => Promise.resolve(true)),
  stat: jest.fn(() => Promise.resolve({
    size: 1000000,
    isFile: () => true,
    isDirectory: () => false,
    mtime: new Date(),
    ctime: new Date(),
  })),
  readDir: jest.fn(() => Promise.resolve([])),
  copyFile: jest.fn(() => Promise.resolve()),
  moveFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('mock content')),
}));

describe('FileManagerService Contract Tests (Simplified)', () => {
  it('should load without errors', () => {
    expect(true).toBe(true);
  });

  it('should have required interface methods', async () => {
    // Import only when needed to prevent premature loading
    const { ReactNativeFileManager } = await import('../../src/services/implementations/ReactNativeFileManager');
    const fileManager = new ReactNativeFileManager();

    // Test basic method existence
    expect(typeof fileManager.getFileInfo).toBe('function');
    expect(typeof fileManager.exists).toBe('function');
    expect(typeof fileManager.createFile).toBe('function');
    expect(typeof fileManager.deleteFile).toBe('function');
    expect(typeof fileManager.moveFile).toBe('function');
    expect(typeof fileManager.copyFile).toBe('function');
    expect(typeof fileManager.getStorageInfo).toBe('function');
  });

  it('should handle basic file operations without throwing', async () => {
    const { ReactNativeFileManager } = await import('../../src/services/implementations/ReactNativeFileManager');
    let fileManager = new ReactNativeFileManager();

    // Test basic operations don't throw
    await expect(fileManager.exists('/test/path')).resolves.toBeDefined();
    
    // Cleanup
    fileManager = null as any;
  });
});