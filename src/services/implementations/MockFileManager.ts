import {
  FileManagerService,
  FileInfo,
  DirectoryInfo,
  StorageInfo,
  FilePermissions,
  FileOperationResult,
  FileOperationType,
  PermissionResult,
  PermissionType,
  PermissionStatus,
  StorageLocation,
  FileAccessError,
  FileAccessErrorType,
  FileMoveOptions,
  FileCopyOptions,
  FileDeleteOptions,
  DirectoryCreateOptions,
  FileSearchOptions,
  FileSearchResult,
  FileValidationResult,
  ThumbnailOptions,
  ThumbnailResult,
  FileWatchEvent,
  FileWatcher,
} from '../FileManagerService';
import { VideoFile, VideoFormat } from '../../types/models';

/**
 * Mock file manager for platforms without native file system access (web, unsupported platforms)
 * Provides graceful degradation with helpful error messages
 */
export class MockFileManager implements FileManagerService {
  private createError(operation: string): FileAccessError {
    return {
      type: FileAccessErrorType.NOT_SUPPORTED,
      message: `File operation "${operation}" is not available on this platform. Please use an Android device.`,
      code: 'PLATFORM_NOT_SUPPORTED',
    };
  }

  // File operations
  async getFileInfo(filePath: string): Promise<FileInfo> {
    throw this.createError('getFileInfo');
  }

  async exists(filePath: string): Promise<boolean> {
    return false;
  }

  async createFile(
    filePath: string,
    content: Uint8Array,
    options?: { createDirectories?: boolean }
  ): Promise<void> {
    throw this.createError('createFile');
  }

  async deleteFile(filePath: string, options?: FileDeleteOptions): Promise<void> {
    throw this.createError('deleteFile');
  }

  async moveFile(
    sourcePath: string,
    targetPath: string,
    options?: FileMoveOptions
  ): Promise<void> {
    throw this.createError('moveFile');
  }

  async copyFile(
    sourcePath: string,
    targetPath: string,
    options?: FileCopyOptions
  ): Promise<void> {
    throw this.createError('copyFile');
  }

  async renameFile(filePath: string, newName: string): Promise<void> {
    throw this.createError('renameFile');
  }

  // Directory operations
  async getDirectoryInfo(
    directoryPath: string,
    includeChildren?: boolean
  ): Promise<DirectoryInfo> {
    throw this.createError('getDirectoryInfo');
  }

  async createDirectory(
    directoryPath: string,
    options?: DirectoryCreateOptions
  ): Promise<void> {
    throw this.createError('createDirectory');
  }

  async deleteDirectory(directoryPath: string, options?: FileDeleteOptions): Promise<void> {
    throw this.createError('deleteDirectory');
  }

  async listDirectory(directoryPath: string, recursive?: boolean): Promise<FileInfo[]> {
    return [];
  }

  // Storage operations
  async getStorageInfo(location: StorageLocation): Promise<StorageInfo> {
    return {
      location,
      totalSpace: 0,
      usedSpace: 0,
      availableSpace: 0,
      isRemovable: false,
      isReadOnly: true,
      path: '',
    };
  }

  async getAvailableSpace(location?: StorageLocation): Promise<number> {
    return 0;
  }

  async getUsedSpace(location?: StorageLocation): Promise<number> {
    return 0;
  }

  async getTotalSpace(location?: StorageLocation): Promise<number> {
    return 0;
  }

  async cleanupTempFiles(): Promise<number> {
    return 0;
  }

  // Permission operations
  async requestPermission(permission: PermissionType): Promise<PermissionResult> {
    return {
      permission,
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }

  async checkPermission(permission: PermissionType): Promise<PermissionStatus> {
    return PermissionStatus.DENIED;
  }

  async hasPermission(permission: PermissionType): Promise<boolean> {
    return false;
  }

  // File watching
  async watchFile(
    filePath: string,
    events: string[],
    callback: (event: FileWatchEvent) => void
  ): Promise<FileWatcher> {
    const watcher: FileWatcher = {
      watcherId: `mock-${Date.now()}`,
      filePath,
      events,
      stop: async () => {},
    };
    return watcher;
  }

  async watchDirectory(
    directoryPath: string,
    events: string[],
    callback: (event: FileWatchEvent) => void,
    recursive?: boolean
  ): Promise<FileWatcher> {
    const watcher: FileWatcher = {
      watcherId: `mock-${Date.now()}`,
      filePath: directoryPath,
      events,
      stop: async () => {},
    };
    return watcher;
  }

  async unwatchFile(watcherId: string): Promise<void> {
    // No-op
  }

  // Media scanning
  async scanMedia(filePath: string): Promise<void> {
    // No-op
  }

  async scanMediaDirectory(directoryPath: string): Promise<void> {
    // No-op
  }

  // Video-specific operations
  async getVideoFiles(directoryPath?: string): Promise<VideoFile[]> {
    return [];
  }

  async getVideoInfo(filePath: string): Promise<VideoFile | null> {
    return null;
  }

  async generateThumbnail(filePath: string, options?: ThumbnailOptions): Promise<ThumbnailResult> {
    throw this.createError('generateThumbnail');
  }

  async validateVideoFile(filePath: string): Promise<FileValidationResult> {
    return {
      isValid: false,
      errors: ['Video operations not supported on this platform'],
    };
  }

  async searchFiles(options: FileSearchOptions): Promise<FileSearchResult[]> {
    return [];
  }

  async getRecentFiles(limit: number, fileTypes?: string[]): Promise<FileInfo[]> {
    return [];
  }

  async getLargeFiles(minSize: number, directoryPath?: string): Promise<FileInfo[]> {
    return [];
  }
}
