import {
  FileManagerService,
  FileInfo,
  DirectoryInfo,
  StorageInfo,
  FileOperation,
  FileOperationType,
  FileOperationResult,
  PermissionType,
  PermissionStatus,
  PermissionResult,
  FileWatcher,
  FileWatchEvent,
  FileWatchEventType,
  FileMoveOptions,
  FileCopyOptions,
  FileDeleteOptions,
  DirectoryCreateOptions,
  FileSearchOptions,
  FileSearchResult,
  StorageLocation,
  FileAccessError,
  FileAccessErrorType,
  FileValidationResult,
  ThumbnailOptions,
  ThumbnailResult,
} from '../../src/services/FileManagerService';
import { VideoFile, VideoFormat } from '../../src/types/models';

describe('FileManagerService Contract', () => {
  let mockFileManager: FileManagerService;
  let mockVideoFile: VideoFile;

  beforeEach(() => {
    // Mock video file
    mockVideoFile = {
      id: 'test-video-001',
      name: 'sample_video.mp4',
      path: '/storage/emulated/0/DCIM/Camera/sample_video.mp4',
      size: 52428800, // 50MB
      mimeType: 'video/mp4',
      format: VideoFormat.MP4,
      createdAt: new Date('2025-09-17T10:00:00Z'),
      modifiedAt: new Date('2025-09-17T10:05:00Z'),
      metadata: {
        duration: 30000,
        width: 1920,
        height: 1080,
        frameRate: 30.0,
        bitrate: 8000000,
        codec: 'h264',
        codecName: 'H.264',
        audioCodec: 'aac',
        audioBitrate: 128000,
        audioSampleRate: 44100,
        audioChannels: 2,
      },
    };

    // Create mock implementation
    mockFileManager = {
      // File operations
      getFileInfo: jest.fn(),
      exists: jest.fn(),
      createFile: jest.fn(),
      deleteFile: jest.fn(),
      moveFile: jest.fn(),
      copyFile: jest.fn(),
      renameFile: jest.fn(),
      
      // Directory operations
      getDirectoryInfo: jest.fn(),
      createDirectory: jest.fn(),
      deleteDirectory: jest.fn(),
      listDirectory: jest.fn(),
      
      // Storage operations
      getStorageInfo: jest.fn(),
      getAvailableSpace: jest.fn(),
      getUsedSpace: jest.fn(),
      getTotalSpace: jest.fn(),
      cleanupTempFiles: jest.fn(),
      
      // Permission operations
      requestPermission: jest.fn(),
      checkPermission: jest.fn(),
      hasPermission: jest.fn(),
      
      // File watching
      watchFile: jest.fn(),
      watchDirectory: jest.fn(),
      unwatchFile: jest.fn(),
      unwatchDirectory: jest.fn(),
      
      // File search and filtering
      searchFiles: jest.fn(),
      findVideoFiles: jest.fn(),
      filterFilesByType: jest.fn(),
      filterFilesBySize: jest.fn(),
      filterFilesByDate: jest.fn(),
      
      // File validation
      validateVideoFile: jest.fn(),
      validateFilePath: jest.fn(),
      validateFileName: jest.fn(),
      
      // Utility operations
      generateThumbnail: jest.fn(),
      getFileMimeType: jest.fn(),
      getFileExtension: jest.fn(),
      sanitizeFileName: jest.fn(),
      generateUniqueFileName: jest.fn(),
      
      // Batch operations
      batchMove: jest.fn(),
      batchCopy: jest.fn(),
      batchDelete: jest.fn(),
    };
  });

  describe('Interface Definition', () => {
    it('should define FileManagerService interface with all required methods', () => {
      expect(mockFileManager).toHaveProperty('getFileInfo');
      expect(mockFileManager).toHaveProperty('exists');
      expect(mockFileManager).toHaveProperty('createFile');
      expect(mockFileManager).toHaveProperty('deleteFile');
      expect(mockFileManager).toHaveProperty('moveFile');
      expect(mockFileManager).toHaveProperty('copyFile');
      expect(mockFileManager).toHaveProperty('getDirectoryInfo');
      expect(mockFileManager).toHaveProperty('createDirectory');
      expect(mockFileManager).toHaveProperty('getStorageInfo');
      expect(mockFileManager).toHaveProperty('requestPermission');
      expect(mockFileManager).toHaveProperty('searchFiles');
      expect(mockFileManager).toHaveProperty('validateVideoFile');
      expect(mockFileManager).toHaveProperty('generateThumbnail');
      expect(mockFileManager).toHaveProperty('batchMove');
    });

    it('should define FileInfo interface', () => {
      const mockFileInfo: FileInfo = {
        name: 'sample.mp4',
        path: '/storage/emulated/0/DCIM/sample.mp4',
        size: 52428800,
        mimeType: 'video/mp4',
        isDirectory: false,
        isFile: true,
        isReadable: true,
        isWritable: true,
        createdAt: new Date(),
        lastModified: new Date(),
        lastAccessed: new Date(),
        permissions: {
          read: true,
          write: true,
          execute: false,
        },
      };

      expect(mockFileInfo).toHaveProperty('name');
      expect(mockFileInfo).toHaveProperty('path');
      expect(mockFileInfo).toHaveProperty('size');
      expect(mockFileInfo).toHaveProperty('isDirectory');
      expect(mockFileInfo).toHaveProperty('permissions');
    });

    it('should define DirectoryInfo interface', () => {
      const mockDirectoryInfo: DirectoryInfo = {
        name: 'VideoConverter',
        path: '/storage/emulated/0/VideoConverter',
        size: 0,
        mimeType: 'inode/directory',
        isDirectory: true,
        isFile: false,
        isReadable: true,
        isWritable: true,
        createdAt: new Date(),
        lastModified: new Date(),
        lastAccessed: new Date(),
        permissions: {
          read: true,
          write: true,
          execute: true,
        },
        itemCount: 5,
        totalSize: 134217728, // 128MB
        children: [],
      };

      expect(mockDirectoryInfo).toHaveProperty('itemCount');
      expect(mockDirectoryInfo).toHaveProperty('totalSize');
      expect(mockDirectoryInfo).toHaveProperty('children');
    });

    it('should define StorageInfo interface', () => {
      const mockStorageInfo: StorageInfo = {
        location: StorageLocation.INTERNAL,
        totalSpace: 137438953472, // 128GB
        availableSpace: 68719476736, // 64GB
        usedSpace: 68719476736, // 64GB
        freeSpace: 68719476736, // 64GB
        isRemovable: false,
        isEmulated: true,
        path: '/storage/emulated/0',
        state: 'mounted',
      };

      expect(mockStorageInfo).toHaveProperty('location');
      expect(mockStorageInfo).toHaveProperty('totalSpace');
      expect(mockStorageInfo).toHaveProperty('availableSpace');
      expect(mockStorageInfo).toHaveProperty('state');
    });
  });

  describe('getFileInfo', () => {
    it('should return file information for existing file', async () => {
      const expectedFileInfo: FileInfo = {
        name: 'sample_video.mp4',
        path: mockVideoFile.path,
        size: mockVideoFile.size,
        mimeType: mockVideoFile.mimeType,
        isDirectory: false,
        isFile: true,
        isReadable: true,
        isWritable: true,
        createdAt: mockVideoFile.createdAt,
        lastModified: new Date('2025-09-17T10:00:00Z'),
        lastAccessed: new Date(),
        permissions: {
          read: true,
          write: true,
          execute: false,
        },
      };

      (mockFileManager.getFileInfo as jest.Mock).mockResolvedValue(expectedFileInfo);

      const fileInfo = await mockFileManager.getFileInfo(mockVideoFile.path);
      
      expect(mockFileManager.getFileInfo).toHaveBeenCalledWith(mockVideoFile.path);
      expect(fileInfo.name).toBe('sample_video.mp4');
      expect(fileInfo.size).toBe(52428800);
      expect(fileInfo.isFile).toBe(true);
    });

    it('should throw error for non-existent file', async () => {
      const error = new FileAccessError(
        FileAccessErrorType.FILE_NOT_FOUND,
        'File not found',
        'FILE_NOT_FOUND'
      );

      (mockFileManager.getFileInfo as jest.Mock).mockRejectedValue(error);

      await expect(mockFileManager.getFileInfo('/non/existent/file.mp4'))
        .rejects.toThrow('File not found');
    });

    it('should handle permission denied errors', async () => {
      const error = new FileAccessError(
        FileAccessErrorType.PERMISSION_DENIED,
        'Permission denied',
        'PERMISSION_DENIED'
      );

      (mockFileManager.getFileInfo as jest.Mock).mockRejectedValue(error);

      await expect(mockFileManager.getFileInfo('/restricted/file.mp4'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      (mockFileManager.exists as jest.Mock).mockResolvedValue(true);

      const exists = await mockFileManager.exists(mockVideoFile.path);
      
      expect(exists).toBe(true);
      expect(mockFileManager.exists).toHaveBeenCalledWith(mockVideoFile.path);
    });

    it('should return false for non-existent file', async () => {
      (mockFileManager.exists as jest.Mock).mockResolvedValue(false);

      const exists = await mockFileManager.exists('/non/existent/file.mp4');
      
      expect(exists).toBe(false);
    });
  });

  describe('createFile', () => {
    it('should create a new file with content', async () => {
      const filePath = '/storage/emulated/0/VideoConverter/output.mp4';
      const content = new Uint8Array([0x00, 0x00, 0x00, 0x20]); // Mock video header

      (mockFileManager.createFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.createFile(filePath, content);
      
      expect(mockFileManager.createFile).toHaveBeenCalledWith(filePath, content);
    });

    it('should handle directory creation if parent doesn\'t exist', async () => {
      const filePath = '/storage/emulated/0/NewDirectory/output.mp4';
      const content = new Uint8Array([0x00, 0x00, 0x00, 0x20]);

      (mockFileManager.createFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.createFile(filePath, content, { createDirectories: true });
      
      expect(mockFileManager.createFile).toHaveBeenCalledWith(filePath, content, { createDirectories: true });
    });

    it('should throw error when file already exists', async () => {
      const error = new FileAccessError(
        FileAccessErrorType.FILE_ALREADY_EXISTS,
        'File already exists',
        'FILE_ALREADY_EXISTS'
      );

      (mockFileManager.createFile as jest.Mock).mockRejectedValue(error);

      await expect(mockFileManager.createFile(mockVideoFile.path, new Uint8Array()))
        .rejects.toThrow('File already exists');
    });
  });

  describe('deleteFile', () => {
    it('should delete an existing file', async () => {
      const deleteOptions: FileDeleteOptions = {
        force: false,
        moveToTrash: true,
      };

      (mockFileManager.deleteFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.deleteFile(mockVideoFile.path, deleteOptions);
      
      expect(mockFileManager.deleteFile).toHaveBeenCalledWith(mockVideoFile.path, deleteOptions);
    });

    it('should handle force deletion', async () => {
      const deleteOptions: FileDeleteOptions = {
        force: true,
        moveToTrash: false,
      };

      (mockFileManager.deleteFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.deleteFile(mockVideoFile.path, deleteOptions);
      
      expect(mockFileManager.deleteFile).toHaveBeenCalledWith(mockVideoFile.path, deleteOptions);
    });

    it('should throw error for protected files', async () => {
      const error = new FileAccessError(
        FileAccessErrorType.PERMISSION_DENIED,
        'Cannot delete protected file',
        'FILE_PROTECTED'
      );

      (mockFileManager.deleteFile as jest.Mock).mockRejectedValue(error);

      await expect(mockFileManager.deleteFile('/system/protected.file'))
        .rejects.toThrow('Cannot delete protected file');
    });
  });

  describe('moveFile', () => {
    it('should move file to new location', async () => {
      const sourcePath = mockVideoFile.path;
      const targetPath = '/storage/emulated/0/VideoConverter/moved_video.mp4';
      const moveOptions: FileMoveOptions = {
        overwrite: false,
        createDirectories: true,
      };

      (mockFileManager.moveFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.moveFile(sourcePath, targetPath, moveOptions);
      
      expect(mockFileManager.moveFile).toHaveBeenCalledWith(sourcePath, targetPath, moveOptions);
    });

    it('should handle move with overwrite', async () => {
      const sourcePath = mockVideoFile.path;
      const targetPath = '/storage/emulated/0/VideoConverter/existing_video.mp4';
      const moveOptions: FileMoveOptions = {
        overwrite: true,
        createDirectories: false,
      };

      (mockFileManager.moveFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.moveFile(sourcePath, targetPath, moveOptions);
      
      expect(mockFileManager.moveFile).toHaveBeenCalledWith(sourcePath, targetPath, moveOptions);
    });

    it('should throw error when target already exists and overwrite is false', async () => {
      const error = new FileAccessError(
        FileAccessErrorType.FILE_ALREADY_EXISTS,
        'Target file already exists',
        'TARGET_EXISTS'
      );

      (mockFileManager.moveFile as jest.Mock).mockRejectedValue(error);

      await expect(mockFileManager.moveFile(
        mockVideoFile.path,
        '/storage/emulated/0/existing.mp4',
        { overwrite: false }
      )).rejects.toThrow('Target file already exists');
    });
  });

  describe('copyFile', () => {
    it('should copy file to new location', async () => {
      const sourcePath = mockVideoFile.path;
      const targetPath = '/storage/emulated/0/VideoConverter/copied_video.mp4';
      const copyOptions: FileCopyOptions = {
        overwrite: false,
        preserveMetadata: true,
        createDirectories: true,
      };

      (mockFileManager.copyFile as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.copyFile(sourcePath, targetPath, copyOptions);
      
      expect(mockFileManager.copyFile).toHaveBeenCalledWith(sourcePath, targetPath, copyOptions);
    });

    it('should handle large file copy with progress callback', async () => {
      const progressCallback = jest.fn();
      const copyOptions: FileCopyOptions = {
        overwrite: true,
        preserveMetadata: false,
        onProgress: progressCallback,
      };

      (mockFileManager.copyFile as jest.Mock).mockImplementation(async (src, dest, options) => {
        // Simulate progress callbacks
        if (options?.onProgress) {
          options.onProgress(25);
          options.onProgress(50);
          options.onProgress(75);
          options.onProgress(100);
        }
      });

      await mockFileManager.copyFile(mockVideoFile.path, '/target.mp4', copyOptions);
      
      expect(progressCallback).toHaveBeenCalledTimes(4);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });
  });

  describe('getDirectoryInfo', () => {
    it('should return directory information with contents', async () => {
      const directoryPath = '/storage/emulated/0/DCIM/Camera';
      const expectedDirectoryInfo: DirectoryInfo = {
        name: 'Camera',
        path: directoryPath,
        size: 0,
        mimeType: 'inode/directory',
        isDirectory: true,
        isFile: false,
        isReadable: true,
        isWritable: true,
        createdAt: new Date('2025-09-01T00:00:00Z'),
        lastModified: new Date('2025-09-17T12:00:00Z'),
        lastAccessed: new Date(),
        permissions: {
          read: true,
          write: true,
          execute: true,
        },
        itemCount: 3,
        totalSize: 157286400, // ~150MB
        children: [
          {
            name: 'video1.mp4',
            path: '/storage/emulated/0/DCIM/Camera/video1.mp4',
            size: 52428800,
            mimeType: 'video/mp4',
            isDirectory: false,
            isFile: true,
            isReadable: true,
            isWritable: true,
            createdAt: new Date(),
            lastModified: new Date(),
            lastAccessed: new Date(),
            permissions: { read: true, write: true, execute: false },
          },
        ],
      };

      (mockFileManager.getDirectoryInfo as jest.Mock).mockResolvedValue(expectedDirectoryInfo);

      const directoryInfo = await mockFileManager.getDirectoryInfo(directoryPath);
      
      expect(directoryInfo.name).toBe('Camera');
      expect(directoryInfo.itemCount).toBe(3);
      expect(directoryInfo.children).toHaveLength(1);
    });

    it('should handle empty directories', async () => {
      const emptyDirectoryInfo: DirectoryInfo = {
        name: 'EmptyDir',
        path: '/storage/emulated/0/EmptyDir',
        size: 0,
        mimeType: 'inode/directory',
        isDirectory: true,
        isFile: false,
        isReadable: true,
        isWritable: true,
        createdAt: new Date(),
        lastModified: new Date(),
        lastAccessed: new Date(),
        permissions: { read: true, write: true, execute: true },
        itemCount: 0,
        totalSize: 0,
        children: [],
      };

      (mockFileManager.getDirectoryInfo as jest.Mock).mockResolvedValue(emptyDirectoryInfo);

      const directoryInfo = await mockFileManager.getDirectoryInfo('/storage/emulated/0/EmptyDir');
      
      expect(directoryInfo.itemCount).toBe(0);
      expect(directoryInfo.children).toHaveLength(0);
    });
  });

  describe('createDirectory', () => {
    it('should create a new directory', async () => {
      const directoryPath = '/storage/emulated/0/VideoConverter/Output';
      const createOptions: DirectoryCreateOptions = {
        recursive: true,
        permissions: 0o755,
      };

      (mockFileManager.createDirectory as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.createDirectory(directoryPath, createOptions);
      
      expect(mockFileManager.createDirectory).toHaveBeenCalledWith(directoryPath, createOptions);
    });

    it('should handle recursive directory creation', async () => {
      const directoryPath = '/storage/emulated/0/New/Nested/Directory';
      const createOptions: DirectoryCreateOptions = {
        recursive: true,
      };

      (mockFileManager.createDirectory as jest.Mock).mockResolvedValue(undefined);

      await mockFileManager.createDirectory(directoryPath, createOptions);
      
      expect(mockFileManager.createDirectory).toHaveBeenCalledWith(directoryPath, createOptions);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information for internal storage', async () => {
      const expectedStorageInfo: StorageInfo = {
        location: StorageLocation.INTERNAL,
        totalSpace: 137438953472, // 128GB
        availableSpace: 68719476736, // 64GB
        usedSpace: 68719476736, // 64GB
        freeSpace: 68719476736, // 64GB
        isRemovable: false,
        isEmulated: true,
        path: '/storage/emulated/0',
        state: 'mounted',
      };

      (mockFileManager.getStorageInfo as jest.Mock).mockResolvedValue(expectedStorageInfo);

      const storageInfo = await mockFileManager.getStorageInfo(StorageLocation.INTERNAL);
      
      expect(storageInfo.location).toBe(StorageLocation.INTERNAL);
      expect(storageInfo.totalSpace).toBe(137438953472);
      expect(storageInfo.isRemovable).toBe(false);
    });

    it('should return storage information for external storage', async () => {
      const expectedStorageInfo: StorageInfo = {
        location: StorageLocation.EXTERNAL,
        totalSpace: 68719476736, // 64GB SD card
        availableSpace: 34359738368, // 32GB
        usedSpace: 34359738368, // 32GB
        freeSpace: 34359738368, // 32GB
        isRemovable: true,
        isEmulated: false,
        path: '/storage/sdcard1',
        state: 'mounted',
      };

      (mockFileManager.getStorageInfo as jest.Mock).mockResolvedValue(expectedStorageInfo);

      const storageInfo = await mockFileManager.getStorageInfo(StorageLocation.EXTERNAL);
      
      expect(storageInfo.location).toBe(StorageLocation.EXTERNAL);
      expect(storageInfo.isRemovable).toBe(true);
    });
  });

  describe('requestPermission', () => {
    it('should request storage permissions', async () => {
      const expectedResult: PermissionResult = {
        permission: PermissionType.STORAGE,
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
      };

      (mockFileManager.requestPermission as jest.Mock).mockResolvedValue(expectedResult);

      const result = await mockFileManager.requestPermission(PermissionType.STORAGE);
      
      expect(result.permission).toBe(PermissionType.STORAGE);
      expect(result.status).toBe(PermissionStatus.GRANTED);
    });

    it('should handle permission denial', async () => {
      const expectedResult: PermissionResult = {
        permission: PermissionType.STORAGE,
        status: PermissionStatus.DENIED,
        canAskAgain: false,
      };

      (mockFileManager.requestPermission as jest.Mock).mockResolvedValue(expectedResult);

      const result = await mockFileManager.requestPermission(PermissionType.STORAGE);
      
      expect(result.status).toBe(PermissionStatus.DENIED);
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('searchFiles', () => {
    it('should search for video files with criteria', async () => {
      const searchOptions: FileSearchOptions = {
        directory: '/storage/emulated/0',
        recursive: true,
        fileTypes: ['mp4', 'mov', 'avi'],
        minSize: 1048576, // 1MB
        maxSize: 104857600, // 100MB
        modifiedAfter: new Date('2025-09-01'),
        namePattern: '*video*',
      };

      const expectedResults: FileSearchResult[] = [
        {
          file: {
            name: 'my_video.mp4',
            path: '/storage/emulated/0/DCIM/my_video.mp4',
            size: 52428800,
            mimeType: 'video/mp4',
            isDirectory: false,
            isFile: true,
            isReadable: true,
            isWritable: true,
            createdAt: new Date('2025-09-15'),
            lastModified: new Date('2025-09-15'),
            lastAccessed: new Date(),
            permissions: { read: true, write: true, execute: false },
          },
          score: 0.95,
          matches: ['name', 'type', 'size'],
        },
      ];

      (mockFileManager.searchFiles as jest.Mock).mockResolvedValue(expectedResults);

      const results = await mockFileManager.searchFiles(searchOptions);
      
      expect(results).toHaveLength(1);
      expect(results[0]?.file.name).toBe('my_video.mp4');
      expect(results[0]?.score).toBe(0.95);
    });

    it('should return empty results when no files match', async () => {
      const searchOptions: FileSearchOptions = {
        directory: '/storage/emulated/0',
        namePattern: 'nonexistent*',
      };

      (mockFileManager.searchFiles as jest.Mock).mockResolvedValue([]);

      const results = await mockFileManager.searchFiles(searchOptions);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('validateVideoFile', () => {
    it('should validate a proper video file', async () => {
      const expectedValidation: FileValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        fileInfo: {
          name: mockVideoFile.name,
          path: mockVideoFile.path,
          size: mockVideoFile.size,
          mimeType: mockVideoFile.mimeType,
          isDirectory: false,
          isFile: true,
          isReadable: true,
          isWritable: true,
          createdAt: mockVideoFile.createdAt,
          lastModified: new Date('2025-09-17T10:00:00Z'),
          lastAccessed: new Date(),
          permissions: { read: true, write: true, execute: false },
        },
      };

      (mockFileManager.validateVideoFile as jest.Mock).mockResolvedValue(expectedValidation);

      const validation = await mockFileManager.validateVideoFile(mockVideoFile.path);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.fileInfo?.name).toBe(mockVideoFile.name);
    });

    it('should detect invalid video files', async () => {
      const expectedValidation: FileValidationResult = {
        isValid: false,
        errors: [
          'Unsupported video format',
          'Corrupted file header',
        ],
        warnings: [
          'Large file size may cause processing delays',
        ],
        fileInfo: null,
      };

      (mockFileManager.validateVideoFile as jest.Mock).mockResolvedValue(expectedValidation);

      const validation = await mockFileManager.validateVideoFile('/invalid/video.file');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unsupported video format');
      expect(validation.warnings).toContain('Large file size may cause processing delays');
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail for video file', async () => {
      const thumbnailOptions: ThumbnailOptions = {
        width: 320,
        height: 240,
        timeOffset: 5000, // 5 seconds
        quality: 'medium',
        format: 'jpeg',
      };

      const expectedThumbnail: ThumbnailResult = {
        success: true,
        thumbnailPath: '/storage/emulated/0/VideoConverter/.thumbnails/sample_video_thumb.jpg',
        width: 320,
        height: 240,
        fileSize: 15360, // 15KB
        format: 'jpeg',
      };

      (mockFileManager.generateThumbnail as jest.Mock).mockResolvedValue(expectedThumbnail);

      const thumbnail = await mockFileManager.generateThumbnail(mockVideoFile.path, thumbnailOptions);
      
      expect(thumbnail.success).toBe(true);
      expect(thumbnail.width).toBe(320);
      expect(thumbnail.height).toBe(240);
      expect(thumbnail.thumbnailPath).toContain('_thumb.jpg');
    });

    it('should handle thumbnail generation failure', async () => {
      const thumbnailOptions: ThumbnailOptions = {
        width: 320,
        height: 240,
      };

      const expectedThumbnail: ThumbnailResult = {
        success: false,
        error: 'Unable to decode video frame',
        width: 0,
        height: 0,
        fileSize: 0,
        format: 'unknown',
      };

      (mockFileManager.generateThumbnail as jest.Mock).mockResolvedValue(expectedThumbnail);

      const thumbnail = await mockFileManager.generateThumbnail('/corrupted/video.mp4', thumbnailOptions);
      
      expect(thumbnail.success).toBe(false);
      expect(thumbnail.error).toBe('Unable to decode video frame');
    });
  });

  describe('batchOperations', () => {
    it('should perform batch move operations', async () => {
      const operations = [
        { source: '/path/file1.mp4', target: '/new/path/file1.mp4' },
        { source: '/path/file2.mp4', target: '/new/path/file2.mp4' },
        { source: '/path/file3.mp4', target: '/new/path/file3.mp4' },
      ];

      const expectedResults: FileOperationResult[] = [
        { success: true, operation: FileOperationType.MOVE, source: '/path/file1.mp4', target: '/new/path/file1.mp4' },
        { success: true, operation: FileOperationType.MOVE, source: '/path/file2.mp4', target: '/new/path/file2.mp4' },
        { success: false, operation: FileOperationType.MOVE, source: '/path/file3.mp4', target: '/new/path/file3.mp4', error: 'Permission denied' },
      ];

      (mockFileManager.batchMove as jest.Mock).mockResolvedValue(expectedResults);

      const results = await mockFileManager.batchMove(operations);
      
      expect(results).toHaveLength(3);
      expect(results[0]?.success).toBe(true);
      expect(results[1]?.success).toBe(true);
      expect(results[2]?.success).toBe(false);
      expect(results[2]?.error).toBe('Permission denied');
    });

    it('should perform batch delete operations', async () => {
      const filePaths = [
        '/temp/file1.mp4',
        '/temp/file2.mp4',
        '/temp/file3.mp4',
      ];

      const expectedResults: FileOperationResult[] = [
        { success: true, operation: FileOperationType.DELETE, source: '/temp/file1.mp4' },
        { success: true, operation: FileOperationType.DELETE, source: '/temp/file2.mp4' },
        { success: true, operation: FileOperationType.DELETE, source: '/temp/file3.mp4' },
      ];

      (mockFileManager.batchDelete as jest.Mock).mockResolvedValue(expectedResults);

      const results = await mockFileManager.batchDelete(filePaths);
      
      expect(results).toHaveLength(3);
      expect(results.every((r: FileOperationResult) => r.success)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should define FileAccessError class with proper types', () => {
      const error = new FileAccessError(
        FileAccessErrorType.PERMISSION_DENIED,
        'Test permission error',
        'TEST_PERMISSION_ERROR',
        { path: '/test/path' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(FileAccessErrorType.PERMISSION_DENIED);
      expect(error.message).toBe('Test permission error');
      expect(error.code).toBe('TEST_PERMISSION_ERROR');
      expect(error.details).toEqual({ path: '/test/path' });
    });

    it('should handle different error types', () => {
      const errorTypes = [
        FileAccessErrorType.FILE_NOT_FOUND,
        FileAccessErrorType.DIRECTORY_NOT_FOUND,
        FileAccessErrorType.PERMISSION_DENIED,
        FileAccessErrorType.FILE_ALREADY_EXISTS,
        FileAccessErrorType.INSUFFICIENT_SPACE,
        FileAccessErrorType.INVALID_PATH,
        FileAccessErrorType.OPERATION_NOT_PERMITTED,
        FileAccessErrorType.STORAGE_NOT_AVAILABLE,
        FileAccessErrorType.UNKNOWN_ERROR,
      ];

      errorTypes.forEach(type => {
        const error = new FileAccessError(type, `Test ${type}`, `TEST_${type}`);
        expect(error.type).toBe(type);
      });
    });
  });

  describe('File Watching', () => {
    it('should watch file for changes', async () => {
      const mockWatcher: FileWatcher = {
        id: 'watcher-001',
        path: mockVideoFile.path,
        isWatching: true,
        events: ['modified', 'deleted'],
      };

      (mockFileManager.watchFile as jest.Mock).mockResolvedValue(mockWatcher);

      const watcher = await mockFileManager.watchFile(
        mockVideoFile.path,
        ['modified', 'deleted'],
        (event: FileWatchEvent) => {
          console.log('File changed:', event);
        }
      );
      
      expect(watcher.id).toBe('watcher-001');
      expect(watcher.isWatching).toBe(true);
      expect(watcher.events).toContain('modified');
    });

    it('should handle file watch events', async () => {
      const eventCallback = jest.fn();
      const mockEvent: FileWatchEvent = {
        type: FileWatchEventType.MODIFIED,
        path: mockVideoFile.path,
        timestamp: new Date(),
        details: {
          previousSize: 52428800,
          newSize: 52428850,
        },
      };

      (mockFileManager.watchFile as jest.Mock).mockImplementation(async (path, events, callback) => {
        // Simulate event
        callback(mockEvent);
        return { id: 'watcher-001', path, isWatching: true, events };
      });

      await mockFileManager.watchFile(mockVideoFile.path, ['modified'], eventCallback);
      
      expect(eventCallback).toHaveBeenCalledWith(mockEvent);
    });
  });
});