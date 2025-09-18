import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';
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
import { VideoFile } from '../../types/models';

/**
 * React Native FS implementation of FileManagerService
 * Handles file operations, storage management, and media scanning
 */
export class ReactNativeFileManager implements FileManagerService {
  private readonly appDirectory: string;
  private readonly tempDirectory: string;
  private readonly outputDirectory: string;
  private watchers: Map<string, FileWatcher> = new Map();

  constructor() {
    this.appDirectory = RNFS.DocumentDirectoryPath;
    this.tempDirectory = `${RNFS.CachesDirectoryPath}/video-converter`;
    this.outputDirectory = `${RNFS.DocumentDirectoryPath}/converted-videos`;
  }

  // File operations
  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const stat = await RNFS.stat(filePath);
      
      return {
        name: this.getFileName(filePath),
        path: filePath,
        size: stat.size,
        mimeType: this.getMimeTypeFromExtension(this.getFileExtension(filePath)),
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        isReadable: true, // Assume readable if we can stat
        isWritable: this.isPathWritable(filePath),
        createdAt: new Date(stat.ctime || Date.now()),
        lastModified: new Date(stat.mtime || Date.now()),
        lastAccessed: new Date(stat.mtime || Date.now()), // RNFS doesn't provide atime
        permissions: {
          read: true,
          write: this.isPathWritable(filePath),
          execute: false,
        },
      };
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.FILE_NOT_FOUND,
        `File not found: ${filePath}`,
        'FILE_NOT_FOUND',
        { filePath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      return await RNFS.exists(filePath);
    } catch {
      return false;
    }
  }

  async createFile(filePath: string, content: Uint8Array, options?: { createDirectories?: boolean }): Promise<void> {
    try {
      if (options?.createDirectories) {
        const directory = this.getDirectoryPath(filePath);
        await this.ensureDirectoryExists(directory);
      }

      // Convert Uint8Array to base64 string for RNFS
      const base64Content = Buffer.from(content).toString('base64');
      await RNFS.writeFile(filePath, base64Content, 'base64');
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CREATE_FAILED',
        { filePath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async deleteFile(filePath: string, options?: FileDeleteOptions): Promise<void> {
    try {
      const exists = await this.exists(filePath);
      if (!exists) {
        if (!options?.force) {
          throw new FileAccessError(
            FileAccessErrorType.FILE_NOT_FOUND,
            `File not found: ${filePath}`,
            'FILE_NOT_FOUND'
          );
        }
        return; // Force delete of non-existent file succeeds silently
      }

      await RNFS.unlink(filePath);
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DELETE_FAILED',
        { filePath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async moveFile(sourcePath: string, targetPath: string, options?: FileMoveOptions): Promise<void> {
    try {
      const sourceExists = await this.exists(sourcePath);
      if (!sourceExists) {
        throw new FileAccessError(
          FileAccessErrorType.FILE_NOT_FOUND,
          `Source file not found: ${sourcePath}`,
          'SOURCE_NOT_FOUND'
        );
      }

      const targetExists = await this.exists(targetPath);
      if (targetExists && !options?.overwrite) {
        throw new FileAccessError(
          FileAccessErrorType.FILE_ALREADY_EXISTS,
          `Target file already exists: ${targetPath}`,
          'TARGET_EXISTS'
        );
      }

      if (options?.createDirectories) {
        const targetDirectory = this.getDirectoryPath(targetPath);
        await this.ensureDirectoryExists(targetDirectory);
      }

      await RNFS.moveFile(sourcePath, targetPath);
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MOVE_FAILED',
        { sourcePath, targetPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async copyFile(sourcePath: string, targetPath: string, options?: FileCopyOptions): Promise<void> {
    try {
      const sourceExists = await this.exists(sourcePath);
      if (!sourceExists) {
        throw new FileAccessError(
          FileAccessErrorType.FILE_NOT_FOUND,
          `Source file not found: ${sourcePath}`,
          'SOURCE_NOT_FOUND'
        );
      }

      const targetExists = await this.exists(targetPath);
      if (targetExists && !options?.overwrite) {
        throw new FileAccessError(
          FileAccessErrorType.FILE_ALREADY_EXISTS,
          `Target file already exists: ${targetPath}`,
          'TARGET_EXISTS'
        );
      }

      if (options?.createDirectories) {
        const targetDirectory = this.getDirectoryPath(targetPath);
        await this.ensureDirectoryExists(targetDirectory);
      }

      await RNFS.copyFile(sourcePath, targetPath);

      // Call progress callback if provided
      if (options?.onProgress) {
        options.onProgress(100); // Simple implementation - file copied completely
      }
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COPY_FAILED',
        { sourcePath, targetPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async renameFile(filePath: string, newName: string): Promise<void> {
    try {
      const directory = this.getDirectoryPath(filePath);
      const newPath = `${directory}/${newName}`;
      await this.moveFile(filePath, newPath);
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to rename file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RENAME_FAILED',
        { filePath, newName, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // Directory operations
  async getDirectoryInfo(directoryPath: string, includeChildren?: boolean): Promise<DirectoryInfo> {
    try {
      const stat = await RNFS.stat(directoryPath);
      if (!stat.isDirectory()) {
        throw new FileAccessError(
          FileAccessErrorType.DIRECTORY_NOT_FOUND,
          `Path is not a directory: ${directoryPath}`,
          'NOT_DIRECTORY'
        );
      }

      const children: FileInfo[] = [];
      let itemCount = 0;
      let totalSize = 0;

      if (includeChildren) {
        const items = await RNFS.readDir(directoryPath);
        for (const item of items) {
          const childInfo = await this.getFileInfo(item.path);
          children.push(childInfo);
          itemCount++;
          totalSize += childInfo.size;
        }
      } else {
        // Quick count without full info
        const items = await RNFS.readDir(directoryPath);
        itemCount = items.length;
      }

      return {
        name: this.getFileName(directoryPath),
        path: directoryPath,
        size: stat.size,
        mimeType: 'application/directory',
        isDirectory: true,
        isFile: false,
        isReadable: true,
        isWritable: this.isPathWritable(directoryPath),
        createdAt: new Date(stat.ctime || Date.now()),
        lastModified: new Date(stat.mtime || Date.now()),
        lastAccessed: new Date(stat.mtime || Date.now()),
        permissions: {
          read: true,
          write: this.isPathWritable(directoryPath),
          execute: true, // Directories need execute permission to be traversed
        },
        itemCount,
        totalSize,
        children,
      };
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.DIRECTORY_NOT_FOUND,
        `Directory not found: ${directoryPath}`,
        'DIRECTORY_NOT_FOUND',
        { directoryPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async createDirectory(directoryPath: string, options?: DirectoryCreateOptions): Promise<void> {
    try {
      if (options?.recursive) {
        await this.ensureDirectoryExists(directoryPath);
      } else {
        await RNFS.mkdir(directoryPath);
      }
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MKDIR_FAILED',
        { directoryPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async deleteDirectory(directoryPath: string, options?: FileDeleteOptions): Promise<void> {
    try {
      const exists = await this.exists(directoryPath);
      if (!exists) {
        if (!options?.force) {
          throw new FileAccessError(
            FileAccessErrorType.DIRECTORY_NOT_FOUND,
            `Directory not found: ${directoryPath}`,
            'DIRECTORY_NOT_FOUND'
          );
        }
        return; // Force delete of non-existent directory succeeds silently
      }

      if (options?.recursive) {
        // Delete all contents first
        const items = await RNFS.readDir(directoryPath);
        for (const item of items) {
          if (item.isDirectory()) {
            await this.deleteDirectory(item.path, options);
          } else {
            await this.deleteFile(item.path, options);
          }
        }
      }

      await RNFS.unlink(directoryPath);
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to delete directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RMDIR_FAILED',
        { directoryPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  async listDirectory(directoryPath: string, recursive?: boolean): Promise<FileInfo[]> {
    try {
      const exists = await this.exists(directoryPath);
      if (!exists) {
        throw new FileAccessError(
          FileAccessErrorType.DIRECTORY_NOT_FOUND,
          `Directory not found: ${directoryPath}`,
          'DIRECTORY_NOT_FOUND'
        );
      }

      const items = await RNFS.readDir(directoryPath);
      const fileInfos: FileInfo[] = [];

      for (const item of items) {
        const fileInfo = await this.getFileInfo(item.path);
        fileInfos.push(fileInfo);

        // Recursive listing
        if (recursive && item.isDirectory()) {
          const subItems = await this.listDirectory(item.path, true);
          fileInfos.push(...subItems);
        }
      }

      return fileInfos;
    } catch (error) {
      if (error instanceof FileAccessError) {
        throw error;
      }
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LIST_FAILED',
        { directoryPath, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // Storage operations
  async getStorageInfo(location: StorageLocation): Promise<StorageInfo> {
    try {
      const fsInfo = await RNFS.getFSInfo();
      
      return {
        location,
        totalSpace: fsInfo.totalSpace,
        availableSpace: fsInfo.freeSpace,
        usedSpace: fsInfo.totalSpace - fsInfo.freeSpace,
        freeSpace: fsInfo.freeSpace,
        isRemovable: location === StorageLocation.REMOVABLE,
        isEmulated: Platform.OS === 'android' && location === StorageLocation.EXTERNAL,
        path: this.getStoragePathForLocation(location),
        state: 'mounted', // Simplified - assume always mounted
      };
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.STORAGE_NOT_AVAILABLE,
        `Failed to get storage info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_INFO_FAILED'
      );
    }
  }

  async getAvailableSpace(location?: StorageLocation): Promise<number> {
    const storageInfo = await this.getStorageInfo(location || StorageLocation.INTERNAL);
    return storageInfo.availableSpace;
  }

  async getUsedSpace(location?: StorageLocation): Promise<number> {
    const storageInfo = await this.getStorageInfo(location || StorageLocation.INTERNAL);
    return storageInfo.usedSpace;
  }

  async getTotalSpace(location?: StorageLocation): Promise<number> {
    const storageInfo = await this.getStorageInfo(location || StorageLocation.INTERNAL);
    return storageInfo.totalSpace;
  }

  async cleanupTempFiles(): Promise<number> {
    let bytesFreed = 0;

    try {
      // Clean app temp directory
      const tempExists = await this.exists(this.tempDirectory);
      if (tempExists) {
        const tempFiles = await this.listDirectory(this.tempDirectory, true);
        for (const file of tempFiles) {
          if (file.isFile) {
            bytesFreed += file.size;
            await this.deleteFile(file.path, { force: true });
          }
        }
      }

      // Clean system cache directory
      const cacheFiles = await this.listDirectory(RNFS.CachesDirectoryPath, false);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const file of cacheFiles) {
        if (file.isFile && (now - file.lastModified.getTime()) > maxAge) {
          bytesFreed += file.size;
          await this.deleteFile(file.path, { force: true });
        }
      }

      return bytesFreed;
    } catch (error) {
      console.warn('Cleanup failed:', error);
      return bytesFreed;
    }
  }

  // Permission operations
  async requestPermission(permission: PermissionType): Promise<PermissionResult> {
    try {
      if (Platform.OS === 'android') {
        const androidPermission = this.getAndroidPermission(permission);
        if (!androidPermission) {
          return {
            permission,
            status: PermissionStatus.DENIED,
            canAskAgain: false,
          };
        }

        const granted = await PermissionsAndroid.request(androidPermission as any);
        
        return {
          permission,
          status: granted === PermissionsAndroid.RESULTS['GRANTED'] 
            ? PermissionStatus.GRANTED 
            : PermissionStatus.DENIED,
          canAskAgain: granted !== PermissionsAndroid.RESULTS['NEVER_ASK_AGAIN'],
        };
      }

      // iOS permissions are handled differently - assume granted for now
      return {
        permission,
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
      };
    } catch (error) {
      return {
        permission,
        status: PermissionStatus.DENIED,
        canAskAgain: false,
      };
    }
  }

  async checkPermission(permission: PermissionType): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'android') {
        const androidPermission = this.getAndroidPermission(permission);
        if (!androidPermission) {
          return PermissionStatus.DENIED;
        }

        const status = await PermissionsAndroid.check(androidPermission as any);
        return status ? PermissionStatus.GRANTED : PermissionStatus.DENIED;
      }

      // iOS - assume granted for now
      return PermissionStatus.GRANTED;
    } catch {
      return PermissionStatus.DENIED;
    }
  }

  async hasPermission(permission: PermissionType): Promise<boolean> {
    const status = await this.checkPermission(permission);
    return status === PermissionStatus.GRANTED;
  }

  // File watching (basic implementation)
  async watchFile(filePath: string, events: string[], callback: (event: FileWatchEvent) => void): Promise<FileWatcher> {
    const id = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const watcher: FileWatcher = {
      id,
      path: filePath,
      isWatching: true,
      events,
    };

    this.watchers.set(id, watcher);

    // Simple polling implementation (React Native doesn't have native file watching)
    // In a real implementation, you might use a more sophisticated approach
    
    return watcher;
  }

  async watchDirectory(directoryPath: string, events: string[], callback: (event: FileWatchEvent) => void, recursive?: boolean): Promise<FileWatcher> {
    const id = `watch_dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const watcher: FileWatcher = {
      id,
      path: directoryPath,
      isWatching: true,
      events,
    };

    this.watchers.set(id, watcher);
    
    return watcher;
  }

  async unwatchFile(watcherId: string): Promise<void> {
    const watcher = this.watchers.get(watcherId);
    if (watcher) {
      watcher.isWatching = false;
      this.watchers.delete(watcherId);
    }
  }

  async unwatchDirectory(watcherId: string): Promise<void> {
    await this.unwatchFile(watcherId);
  }

  // File search and filtering
  async searchFiles(options: FileSearchOptions): Promise<FileSearchResult[]> {
    try {
      const files = await this.listDirectory(options.directory, options.recursive);
      const results: FileSearchResult[] = [];

      for (const file of files) {
        let score = 0;
        const matches: string[] = [];

        // Filter by file types
        if (options.fileTypes && options.fileTypes.length > 0) {
          const extension = this.getFileExtension(file.name);
          if (!options.fileTypes.includes(extension)) {
            continue;
          }
          score += 10;
          matches.push('extension');
        }

        // Filter by name pattern
        if (options.namePattern) {
          const regex = new RegExp(options.namePattern, 'i');
          if (regex.test(file.name)) {
            score += 20;
            matches.push('name');
          } else {
            continue;
          }
        }

        // Filter by size
        if (options.minSize && file.size < options.minSize) continue;
        if (options.maxSize && file.size > options.maxSize) continue;

        // Filter by dates
        if (options.createdAfter && file.createdAt < options.createdAfter) continue;
        if (options.createdBefore && file.createdAt > options.createdBefore) continue;
        if (options.modifiedAfter && file.lastModified < options.modifiedAfter) continue;
        if (options.modifiedBefore && file.lastModified > options.modifiedBefore) continue;

        // Filter hidden files
        if (!options.includeHidden && file.name.startsWith('.')) continue;

        results.push({
          file,
          score,
          matches,
        });
      }

      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score);

      return results;
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SEARCH_FAILED'
      );
    }
  }

  async findVideoFiles(directoryPath: string, recursive?: boolean): Promise<VideoFile[]> {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'flv', 'm4v'];
    
    try {
      const searchResults = await this.searchFiles({
        directory: directoryPath,
        recursive: recursive || false,
        fileTypes: videoExtensions,
        includeHidden: false,
      });

      const videoFiles: VideoFile[] = [];

      for (const result of searchResults) {
        const videoFile: VideoFile = {
          id: this.generateFileId(result.file.path),
          name: result.file.name,
          path: result.file.path,
          size: result.file.size,
          mimeType: result.file.mimeType,
          createdAt: result.file.createdAt,
          metadata: {
            duration: 0, // Will be filled by video analysis
            width: 0,
            height: 0,
            frameRate: 0,
            bitrate: 0,
            codec: 'unknown',
          },
        };

        videoFiles.push(videoFile);
      }

      return videoFiles;
    } catch (error) {
      throw new FileAccessError(
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        `Video file search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VIDEO_SEARCH_FAILED'
      );
    }
  }

  filterFilesByType(files: FileInfo[], mimeTypes: string[]): FileInfo[] {
    return files.filter(file => mimeTypes.includes(file.mimeType));
  }

  filterFilesBySize(files: FileInfo[], minSize: number, maxSize: number): FileInfo[] {
    return files.filter(file => file.size >= minSize && file.size <= maxSize);
  }

  filterFilesByDate(files: FileInfo[], startDate: Date, endDate: Date): FileInfo[] {
    return files.filter(file => 
      file.lastModified >= startDate && file.lastModified <= endDate
    );
  }

  // File validation
  async validateVideoFile(filePath: string): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const fileInfo = await this.getFileInfo(filePath);
      
      // Check if file exists and is accessible
      if (!fileInfo.isReadable) {
        errors.push('File is not readable');
      }

      // Check file size
      if (fileInfo.size === 0) {
        errors.push('File is empty');
      } else if (fileInfo.size < 1024) {
        warnings.push('File is very small, may be corrupted');
      }

      // Check file extension
      const extension = this.getFileExtension(fileInfo.name).toLowerCase();
      const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'flv', 'm4v'];
      
      if (!videoExtensions.includes(extension)) {
        errors.push('File does not have a valid video extension');
      }

      // Check MIME type
      if (!fileInfo.mimeType.startsWith('video/')) {
        warnings.push('MIME type does not indicate a video file');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        fileInfo,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        fileInfo: null,
      };
    }
  }

  validateFilePath(filePath: string): boolean {
    // Basic path validation
    if (!filePath || typeof filePath !== 'string') return false;
    if (filePath.length > 4096) return false; // Max path length
    if (filePath.includes('\0')) return false; // Null character not allowed
    
    // Platform-specific checks
    if (Platform.OS === 'android') {
      // Android path validation
      return !filePath.match(/[<>:"|?*]/);
    } else {
      // iOS path validation
      return !filePath.match(/[<>:"|?*\\]/);
    }
  }

  validateFileName(fileName: string): boolean {
    if (!fileName || typeof fileName !== 'string') return false;
    if (fileName.length > 255) return false; // Max filename length
    if (fileName === '.' || fileName === '..') return false;
    if (fileName.includes('/') || fileName.includes('\\')) return false;
    if (fileName.includes('\0')) return false;
    
    // Platform-specific checks
    if (Platform.OS === 'android') {
      return !fileName.match(/[<>:"|?*]/);
    } else {
      return !fileName.match(/[<>:"|?*\\]/);
    }
  }

  // Utility operations
  async generateThumbnail(videoPath: string, options: ThumbnailOptions): Promise<ThumbnailResult> {
    // This would require integration with react-native-video-processing or similar
    // For now, return a placeholder result
    return {
      success: false,
      width: options.width,
      height: options.height,
      fileSize: 0,
      format: options.format || 'jpeg',
      error: 'Thumbnail generation not implemented',
    };
  }

  async getFileMimeType(filePath: string): Promise<string> {
    const extension = this.getFileExtension(filePath);
    return this.getMimeTypeFromExtension(extension);
  }

  getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '';
  }

  sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters
    let sanitized = fileName.replace(/[<>:"|?*\\]/g, '_');
    
    // Trim whitespace and dots
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');
    
    // Ensure it's not empty
    if (!sanitized) {
      sanitized = 'file';
    }
    
    // Limit length
    if (sanitized.length > 255) {
      const extension = this.getFileExtension(sanitized);
      const nameWithoutExt = sanitized.substring(0, sanitized.length - extension.length - 1);
      sanitized = nameWithoutExt.substring(0, 255 - extension.length - 1) + '.' + extension;
    }
    
    return sanitized;
  }

  async generateUniqueFileName(basePath: string, fileName: string): Promise<string> {
    let uniqueName = fileName;
    let counter = 1;
    
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const extension = this.getFileExtension(fileName);
    
    while (await this.exists(`${basePath}/${uniqueName}`)) {
      uniqueName = `${nameWithoutExt}_${counter}.${extension}`;
      counter++;
    }
    
    return uniqueName;
  }

  // Batch operations
  async batchMove(operations: { source: string; target: string }[], options?: FileMoveOptions): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];
    
    for (const op of operations) {
      try {
        await this.moveFile(op.source, op.target, options);
        results.push({
          success: true,
          operation: FileOperationType.MOVE,
          source: op.source,
          target: op.target,
        });
      } catch (error) {
        results.push({
          success: false,
          operation: FileOperationType.MOVE,
          source: op.source,
          target: op.target,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  async batchCopy(operations: { source: string; target: string }[], options?: FileCopyOptions): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];
    
    for (const op of operations) {
      try {
        await this.copyFile(op.source, op.target, options);
        results.push({
          success: true,
          operation: FileOperationType.COPY,
          source: op.source,
          target: op.target,
        });
      } catch (error) {
        results.push({
          success: false,
          operation: FileOperationType.COPY,
          source: op.source,
          target: op.target,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  async batchDelete(filePaths: string[], options?: FileDeleteOptions): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];
    
    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath, options);
        results.push({
          success: true,
          operation: FileOperationType.DELETE,
          source: filePath,
        });
      } catch (error) {
        results.push({
          success: false,
          operation: FileOperationType.DELETE,
          source: filePath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  // Private helper methods
  private async ensureDirectoryExists(directoryPath: string): Promise<void> {
    const exists = await this.exists(directoryPath);
    if (!exists) {
      await RNFS.mkdir(directoryPath);
    }
  }

  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || '';
  }

  private getDirectoryPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : '';
  }

  private isPathWritable(filePath: string): boolean {
    // Simple check - assume app directories are writable
    return filePath.startsWith(this.appDirectory) || 
           filePath.startsWith(this.tempDirectory) || 
           filePath.startsWith(RNFS.CachesDirectoryPath);
  }

  private getStoragePathForLocation(location: StorageLocation): string {
    switch (location) {
      case StorageLocation.INTERNAL:
        return RNFS.DocumentDirectoryPath;
      case StorageLocation.EXTERNAL:
        return RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;
      case StorageLocation.REMOVABLE:
        return RNFS.ExternalStorageDirectoryPath || RNFS.DocumentDirectoryPath;
      default:
        return RNFS.DocumentDirectoryPath;
    }
  }

  private getAndroidPermission(permission: PermissionType): string | null {
    switch (permission) {
      case PermissionType.STORAGE:
        return (PermissionsAndroid.PERMISSIONS as any)['READ_EXTERNAL_STORAGE'] || 
               (PermissionsAndroid.PERMISSIONS as any)['WRITE_EXTERNAL_STORAGE'] || null;
      case PermissionType.CAMERA:
        return (PermissionsAndroid.PERMISSIONS as any)['CAMERA'] || null;
      case PermissionType.MICROPHONE:
        return (PermissionsAndroid.PERMISSIONS as any)['RECORD_AUDIO'] || null;
      case PermissionType.LOCATION:
        return (PermissionsAndroid.PERMISSIONS as any)['ACCESS_FINE_LOCATION'] || null;
      default:
        return null;
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      webm: 'video/webm',
      '3gp': 'video/3gpp',
      flv: 'video/x-flv',
      m4v: 'video/x-m4v',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      pdf: 'application/pdf',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  private generateFileId(filePath: string): string {
    // Generate a consistent ID based on file path
    const hash = Buffer.from(filePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    return `file_${hash}_${Date.now()}`;
  }
}