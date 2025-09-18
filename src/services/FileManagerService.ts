import { VideoFile } from '../types/models';

// Enums
export enum StorageLocation {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  REMOVABLE = 'removable',
}

export enum PermissionType {
  STORAGE = 'storage',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  LOCATION = 'location',
}

export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NEVER_ASK_AGAIN = 'never_ask_again',
  UNDETERMINED = 'undetermined',
}

export enum FileOperationType {
  CREATE = 'create',
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  MOVE = 'move',
  COPY = 'copy',
  RENAME = 'rename',
}

export enum FileWatchEventType {
  CREATED = 'created',
  MODIFIED = 'modified',
  DELETED = 'deleted',
  MOVED = 'moved',
  RENAMED = 'renamed',
}

export enum FileAccessErrorType {
  FILE_NOT_FOUND = 'file_not_found',
  DIRECTORY_NOT_FOUND = 'directory_not_found',
  PERMISSION_DENIED = 'permission_denied',
  FILE_ALREADY_EXISTS = 'file_already_exists',
  INSUFFICIENT_SPACE = 'insufficient_space',
  INVALID_PATH = 'invalid_path',
  OPERATION_NOT_PERMITTED = 'operation_not_permitted',
  STORAGE_NOT_AVAILABLE = 'storage_not_available',
  UNKNOWN_ERROR = 'unknown_error',
}

// Base interfaces
export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  isDirectory: boolean;
  isFile: boolean;
  isReadable: boolean;
  isWritable: boolean;
  createdAt: Date;
  lastModified: Date;
  lastAccessed: Date;
  permissions: FilePermissions;
}

export interface DirectoryInfo extends FileInfo {
  itemCount: number;
  totalSize: number;
  children: FileInfo[];
}

export interface StorageInfo {
  location: StorageLocation;
  totalSpace: number;
  availableSpace: number;
  usedSpace: number;
  freeSpace: number;
  isRemovable: boolean;
  isEmulated: boolean;
  path: string;
  state: string;
}

// Operation interfaces
export interface FileOperation {
  type: FileOperationType;
  source: string;
  target?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FileOperationResult {
  success: boolean;
  operation: FileOperationType;
  source: string;
  target?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface PermissionResult {
  permission: PermissionType;
  status: PermissionStatus;
  canAskAgain: boolean;
}

// File watching interfaces
export interface FileWatchEvent {
  type: FileWatchEventType;
  path: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface FileWatcher {
  id: string;
  path: string;
  isWatching: boolean;
  events: string[];
}

// Options interfaces
export interface FileMoveOptions {
  overwrite?: boolean;
  createDirectories?: boolean;
  preserveMetadata?: boolean;
}

export interface FileCopyOptions {
  overwrite?: boolean;
  preserveMetadata?: boolean;
  createDirectories?: boolean;
  onProgress?: (percentage: number) => void;
}

export interface FileDeleteOptions {
  force?: boolean;
  moveToTrash?: boolean;
  recursive?: boolean;
}

export interface DirectoryCreateOptions {
  recursive?: boolean;
  permissions?: number;
}

export interface FileSearchOptions {
  directory: string;
  recursive?: boolean;
  fileTypes?: string[];
  namePattern?: string;
  minSize?: number;
  maxSize?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  includeHidden?: boolean;
}

export interface FileSearchResult {
  file: FileInfo;
  score: number;
  matches: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: FileInfo | null;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  timeOffset?: number; // in milliseconds for video
  quality?: 'low' | 'medium' | 'high';
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ThumbnailResult {
  success: boolean;
  thumbnailPath?: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  error?: string;
}

// Error class
export class FileAccessError extends Error {
  public readonly type: FileAccessErrorType;
  public readonly code: string;
  public readonly details?: Record<string, any> | undefined;

  constructor(
    type: FileAccessErrorType,
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'FileAccessError';
    this.type = type;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileAccessError);
    }
  }
}

// Main service interface
export interface FileManagerService {
  // File operations
  getFileInfo(filePath: string): Promise<FileInfo>;
  exists(filePath: string): Promise<boolean>;
  createFile(filePath: string, content: Uint8Array, options?: { createDirectories?: boolean }): Promise<void>;
  deleteFile(filePath: string, options?: FileDeleteOptions): Promise<void>;
  moveFile(sourcePath: string, targetPath: string, options?: FileMoveOptions): Promise<void>;
  copyFile(sourcePath: string, targetPath: string, options?: FileCopyOptions): Promise<void>;
  renameFile(filePath: string, newName: string): Promise<void>;

  // Directory operations
  getDirectoryInfo(directoryPath: string, includeChildren?: boolean): Promise<DirectoryInfo>;
  createDirectory(directoryPath: string, options?: DirectoryCreateOptions): Promise<void>;
  deleteDirectory(directoryPath: string, options?: FileDeleteOptions): Promise<void>;
  listDirectory(directoryPath: string, recursive?: boolean): Promise<FileInfo[]>;

  // Storage operations
  getStorageInfo(location: StorageLocation): Promise<StorageInfo>;
  getAvailableSpace(location?: StorageLocation): Promise<number>;
  getUsedSpace(location?: StorageLocation): Promise<number>;
  getTotalSpace(location?: StorageLocation): Promise<number>;
  cleanupTempFiles(): Promise<number>; // returns number of bytes cleaned

  // Permission operations
  requestPermission(permission: PermissionType): Promise<PermissionResult>;
  checkPermission(permission: PermissionType): Promise<PermissionStatus>;
  hasPermission(permission: PermissionType): Promise<boolean>;

  // File watching
  watchFile(filePath: string, events: string[], callback: (event: FileWatchEvent) => void): Promise<FileWatcher>;
  watchDirectory(directoryPath: string, events: string[], callback: (event: FileWatchEvent) => void, recursive?: boolean): Promise<FileWatcher>;
  unwatchFile(watcherId: string): Promise<void>;
  unwatchDirectory(watcherId: string): Promise<void>;

  // File search and filtering
  searchFiles(options: FileSearchOptions): Promise<FileSearchResult[]>;
  findVideoFiles(directoryPath: string, recursive?: boolean): Promise<VideoFile[]>;
  filterFilesByType(files: FileInfo[], mimeTypes: string[]): FileInfo[];
  filterFilesBySize(files: FileInfo[], minSize: number, maxSize: number): FileInfo[];
  filterFilesByDate(files: FileInfo[], startDate: Date, endDate: Date): FileInfo[];

  // File validation
  validateVideoFile(filePath: string): Promise<FileValidationResult>;
  validateFilePath(filePath: string): boolean;
  validateFileName(fileName: string): boolean;

  // Utility operations
  generateThumbnail(videoPath: string, options: ThumbnailOptions): Promise<ThumbnailResult>;
  getFileMimeType(filePath: string): Promise<string>;
  getFileExtension(fileName: string): string;
  sanitizeFileName(fileName: string): string;
  generateUniqueFileName(basePath: string, fileName: string): Promise<string>;

  // Batch operations
  batchMove(operations: { source: string; target: string }[], options?: FileMoveOptions): Promise<FileOperationResult[]>;
  batchCopy(operations: { source: string; target: string }[], options?: FileCopyOptions): Promise<FileOperationResult[]>;
  batchDelete(filePaths: string[], options?: FileDeleteOptions): Promise<FileOperationResult[]>;
}