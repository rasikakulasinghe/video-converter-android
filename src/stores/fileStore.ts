import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  FileManagerService,
  FileInfo,
  DirectoryInfo,
  StorageInfo,
  StorageLocation,
  PermissionType,
  PermissionStatus,
  PermissionResult,
  FileOperation,
  FileOperationType,
  FileOperationResult,
  FileWatcher,
  FileWatchEvent,
  FileWatchEventType,
  FileSearchOptions,
  FileSearchResult,
  FileMoveOptions,
  FileCopyOptions,
  FileDeleteOptions,
  ThumbnailOptions,
  ThumbnailResult,
  FileValidationResult,
} from '../services/FileManagerService';
import { FileManagerFactory } from '../services/FileManagerFactory';
import { VideoFile } from '../types/models';

/**
 * File management store state interface
 */
interface FileState {
  // Current directory and files
  currentDirectory: string;
  currentDirectoryInfo: DirectoryInfo | null;
  files: FileInfo[];
  videoFiles: VideoFile[];
  selectedFiles: string[];
  processedFiles: VideoFile[];  // Add this property

  // Storage information
  storageInfo: Record<StorageLocation, StorageInfo | null>;
  totalStorageUsed: number;
  totalStorageAvailable: number;

  // Permissions
  permissions: Record<PermissionType, PermissionStatus>;
  
  // File operations
  operationHistory: FileOperation[];
  activeOperations: FileOperation[];
  fileWatchers: FileWatcher[];
  
  // Search and filtering
  searchResults: FileSearchResult[];
  searchQuery: string;
  currentFilter: {
    type?: string[];
    sizeRange?: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
  };
  
  // UI state
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  lastUpdate: Date | null;
  viewMode: 'list' | 'grid';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';

  // Actions
  loadDirectory: (path: string) => Promise<void>;
  refreshDirectory: () => Promise<void>;
  navigateUp: () => Promise<void>;
  navigateToPath: (path: string) => Promise<void>;
  
  // File operations
  selectFile: (filePath: string) => void;
  selectMultipleFiles: (filePaths: string[]) => void;
  deselectFile: (filePath: string) => void;
  clearSelection: () => void;
  
  // Video file management for MainScreen
  addFile: (file: VideoFile) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  
  // File manipulation
  createFile: (filePath: string, content: Uint8Array) => Promise<void>;
  deleteFile: (filePath: string, options?: FileDeleteOptions) => Promise<void>;
  deleteSelectedFiles: (options?: FileDeleteOptions) => Promise<void>;
  moveFile: (sourcePath: string, targetPath: string, options?: FileMoveOptions) => Promise<void>;
  moveSelectedFiles: (targetPath: string, options?: FileMoveOptions) => Promise<void>;
  copyFile: (sourcePath: string, targetPath: string, options?: FileCopyOptions) => Promise<void>;
  copySelectedFiles: (targetPath: string, options?: FileCopyOptions) => Promise<void>;
  renameFile: (filePath: string, newName: string) => Promise<void>;
  
  // Directory operations
  createDirectory: (path: string) => Promise<void>;
  deleteDirectory: (path: string, recursive?: boolean) => Promise<void>;
  
  // Storage management
  loadStorageInfo: () => Promise<void>;
  cleanupTempFiles: () => Promise<number>;
  
  // Permission management
  requestPermission: (permission: PermissionType) => Promise<PermissionResult>;
  checkAllPermissions: () => Promise<void>;
  
  // File watching
  watchCurrentDirectory: () => Promise<void>;
  stopWatchingDirectory: () => Promise<void>;
  
  // Search and filtering
  searchFiles: (query: string, options?: Partial<FileSearchOptions>) => Promise<void>;
  clearSearch: () => void;
  applyFilter: (filter: Partial<FileState['currentFilter']>) => void;
  clearFilter: () => void;
  sortFiles: (sortBy: FileState['sortBy'], order: FileState['sortOrder']) => void;
  
  // Video file operations
  loadVideoFiles: (directoryPath?: string) => Promise<void>;
  validateVideoFile: (filePath: string) => Promise<FileValidationResult>;
  generateThumbnail: (videoPath: string, options?: Partial<ThumbnailOptions>) => Promise<ThumbnailResult>;
  
  // Utility actions
  getFileInfo: (filePath: string) => Promise<FileInfo>;
  generateUniqueFileName: (basePath: string, fileName: string) => Promise<string>;
  sanitizeFileName: (fileName: string) => string;
  
  // View controls
  setViewMode: (mode: 'list' | 'grid') => void;
  
  // Utility actions
  clearError: () => void;
  clearHistory: () => void;
}

// Create service instance using factory (handles platform-specific implementations)
const fileManagerService: FileManagerService = FileManagerFactory.getInstance();

// Default thumbnail options
const defaultThumbnailOptions: ThumbnailOptions = {
  width: 200,
  height: 200,
  timeOffset: 1000,
  quality: 'medium',
  format: 'jpeg',
};

/**
 * Zustand store for file management and operations
 */
export const useFileStore = create<FileState>()(
  subscribeWithSelector((set, get) => {
    let directoryWatcher: FileWatcher | null = null;

    const sortFileArray = (files: FileInfo[], sortBy: FileState['sortBy'], order: FileState['sortOrder']): FileInfo[] => {
      return [...files].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = a.lastModified.getTime() - b.lastModified.getTime();
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'type':
            comparison = a.mimeType.localeCompare(b.mimeType);
            break;
        }
        
        return order === 'desc' ? -comparison : comparison;
      });
    };

    const applyCurrentFilter = (files: FileInfo[]): FileInfo[] => {
      const { currentFilter } = get();
      let filteredFiles = files;
      
      if (currentFilter.type && currentFilter.type.length > 0) {
        filteredFiles = fileManagerService.filterFilesByType(filteredFiles, currentFilter.type);
      }
      
      if (currentFilter.sizeRange) {
        filteredFiles = fileManagerService.filterFilesBySize(
          filteredFiles,
          currentFilter.sizeRange.min,
          currentFilter.sizeRange.max
        );
      }
      
      if (currentFilter.dateRange) {
        filteredFiles = fileManagerService.filterFilesByDate(
          filteredFiles,
          currentFilter.dateRange.start,
          currentFilter.dateRange.end
        );
      }
      
      return filteredFiles;
    };

    return {
      // Initial state
      currentDirectory: '/storage/emulated/0',
      currentDirectoryInfo: null,
      files: [],
      videoFiles: [],
      selectedFiles: [],
      processedFiles: [],
      storageInfo: {
        [StorageLocation.INTERNAL]: null,
        [StorageLocation.EXTERNAL]: null,
        [StorageLocation.REMOVABLE]: null,
      },
      totalStorageUsed: 0,
      totalStorageAvailable: 0,
      permissions: {
        [PermissionType.STORAGE]: PermissionStatus.UNDETERMINED,
        [PermissionType.CAMERA]: PermissionStatus.UNDETERMINED,
        [PermissionType.MICROPHONE]: PermissionStatus.UNDETERMINED,
        [PermissionType.LOCATION]: PermissionStatus.UNDETERMINED,
      },
      operationHistory: [],
      activeOperations: [],
      fileWatchers: [],
      searchResults: [],
      searchQuery: '',
      currentFilter: {},
      isLoading: false,
      isSearching: false,
      error: null,
      lastUpdate: null,
      viewMode: 'list',
      sortBy: 'name',
      sortOrder: 'asc',

      // Directory navigation
      loadDirectory: async (path: string): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          const [directoryInfo, files] = await Promise.all([
            fileManagerService.getDirectoryInfo(path, true),
            fileManagerService.listDirectory(path, false),
          ]);

          const { sortBy, sortOrder } = get();
          const sortedFiles = sortFileArray(files, sortBy, sortOrder);
          const filteredFiles = applyCurrentFilter(sortedFiles);

          set({
            currentDirectory: path,
            currentDirectoryInfo: directoryInfo,
            files: filteredFiles,
            selectedFiles: [],
            lastUpdate: new Date(),
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load directory:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load directory',
            isLoading: false,
          });
        }
      },

      refreshDirectory: async (): Promise<void> => {
        const { currentDirectory } = get();
        await get().loadDirectory(currentDirectory);
      },

      navigateUp: async (): Promise<void> => {
        const { currentDirectory } = get();
        const parentPath = currentDirectory.split('/').slice(0, -1).join('/') || '/';
        await get().loadDirectory(parentPath);
      },

      navigateToPath: async (path: string): Promise<void> => {
        await get().loadDirectory(path);
      },

      // File selection
      selectFile: (filePath: string): void => {
        const { selectedFiles } = get();
        if (!selectedFiles.includes(filePath)) {
          set({ selectedFiles: [...selectedFiles, filePath] });
        }
      },

      selectMultipleFiles: (filePaths: string[]): void => {
        const { selectedFiles } = get();
        const newSelected = [...new Set([...selectedFiles, ...filePaths])];
        set({ selectedFiles: newSelected });
      },

      deselectFile: (filePath: string): void => {
        const { selectedFiles } = get();
        set({ selectedFiles: selectedFiles.filter(path => path !== filePath) });
      },

      clearSelection: (): void => {
        set({ selectedFiles: [] });
      },

      // Video file management for MainScreen
      addFile: (file: VideoFile): void => {
        const { videoFiles, selectedFiles } = get();
        const exists = videoFiles.find(f => f.id === file.id);
        if (!exists) {
          set({
            videoFiles: [...videoFiles, file],
            selectedFiles: [...selectedFiles, file.path]
          });
        }
      },

      removeFile: (fileId: string): void => {
        const { videoFiles, selectedFiles } = get();
        const file = videoFiles.find(f => f.id === fileId);
        set({
          videoFiles: videoFiles.filter(f => f.id !== fileId),
          selectedFiles: file ? selectedFiles.filter(path => path !== file.path) : selectedFiles
        });
      },

      clearFiles: (): void => {
        set({ videoFiles: [], selectedFiles: [] });
      },

      // File operations
      createFile: async (filePath: string, content: Uint8Array): Promise<void> => {
        try {
          await fileManagerService.createFile(filePath, content, { createDirectories: true });
          const operation: FileOperation = {
            type: FileOperationType.CREATE,
            source: filePath,
            timestamp: new Date(),
          };
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, operation] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to create file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to create file' });
        }
      },

      deleteFile: async (filePath: string, options?: FileDeleteOptions): Promise<void> => {
        try {
          await fileManagerService.deleteFile(filePath, options);
          const operation: FileOperation = {
            type: FileOperationType.DELETE,
            source: filePath,
            timestamp: new Date(),
          };
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, operation] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to delete file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
        }
      },

      deleteSelectedFiles: async (options?: FileDeleteOptions): Promise<void> => {
        const { selectedFiles } = get();
        if (selectedFiles.length === 0) return;
        
        try {
          const results = await fileManagerService.batchDelete(selectedFiles, options);
          const operations: FileOperation[] = results.map(result => ({
            type: FileOperationType.DELETE,
            source: result.source,
            timestamp: new Date(),
          }));
          
          const { operationHistory } = get();
          set({ 
            operationHistory: [...operationHistory, ...operations],
            selectedFiles: [],
          });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to delete selected files:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to delete selected files' });
        }
      },

      moveFile: async (sourcePath: string, targetPath: string, options?: FileMoveOptions): Promise<void> => {
        try {
          await fileManagerService.moveFile(sourcePath, targetPath, options);
          const operation: FileOperation = {
            type: FileOperationType.MOVE,
            source: sourcePath,
            target: targetPath,
            timestamp: new Date(),
          };
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, operation] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to move file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to move file' });
        }
      },

      moveSelectedFiles: async (targetPath: string, options?: FileMoveOptions): Promise<void> => {
        const { selectedFiles } = get();
        if (selectedFiles.length === 0) return;
        
        try {
          const operations = selectedFiles.map(source => ({
            source,
            target: `${targetPath}/${source.split('/').pop()}`,
          }));
          
          const results = await fileManagerService.batchMove(operations, options);
          const operationRecords: FileOperation[] = results.map(result => ({
            type: FileOperationType.MOVE,
            source: result.source,
            target: result.target || '',
            timestamp: new Date(),
          }));
          
          const { operationHistory } = get();
          set({ 
            operationHistory: [...operationHistory, ...operationRecords],
            selectedFiles: [],
          });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to move selected files:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to move selected files' });
        }
      },

      copyFile: async (sourcePath: string, targetPath: string, options?: FileCopyOptions): Promise<void> => {
        try {
          await fileManagerService.copyFile(sourcePath, targetPath, options);
          const operation: FileOperation = {
            type: FileOperationType.COPY,
            source: sourcePath,
            target: targetPath,
            timestamp: new Date(),
          };
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, operation] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to copy file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to copy file' });
        }
      },

      copySelectedFiles: async (targetPath: string, options?: FileCopyOptions): Promise<void> => {
        const { selectedFiles } = get();
        if (selectedFiles.length === 0) return;
        
        try {
          const operations = selectedFiles.map(source => ({
            source,
            target: `${targetPath}/${source.split('/').pop()}`,
          }));
          
          const results = await fileManagerService.batchCopy(operations, options);
          const operationRecords: FileOperation[] = results.map(result => ({
            type: FileOperationType.COPY,
            source: result.source,
            target: result.target || '',
            timestamp: new Date(),
          }));
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, ...operationRecords] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to copy selected files:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to copy selected files' });
        }
      },

      renameFile: async (filePath: string, newName: string): Promise<void> => {
        try {
          await fileManagerService.renameFile(filePath, newName);
          const operation: FileOperation = {
            type: FileOperationType.RENAME,
            source: filePath,
            target: `${filePath.split('/').slice(0, -1).join('/')}/${newName}`,
            timestamp: new Date(),
          };
          
          const { operationHistory } = get();
          set({ operationHistory: [...operationHistory, operation] });
          
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to rename file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to rename file' });
        }
      },

      // Directory operations
      createDirectory: async (path: string): Promise<void> => {
        try {
          await fileManagerService.createDirectory(path, { recursive: true });
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to create directory:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to create directory' });
        }
      },

      deleteDirectory: async (path: string, recursive = false): Promise<void> => {
        try {
          await fileManagerService.deleteDirectory(path, { recursive });
          await get().refreshDirectory();
        } catch (error) {
          console.error('Failed to delete directory:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to delete directory' });
        }
      },

      // Storage management
      loadStorageInfo: async (): Promise<void> => {
        try {
          const [internalStorage, externalStorage, removableStorage] = await Promise.allSettled([
            fileManagerService.getStorageInfo(StorageLocation.INTERNAL),
            fileManagerService.getStorageInfo(StorageLocation.EXTERNAL),
            fileManagerService.getStorageInfo(StorageLocation.REMOVABLE),
          ]);

          const storageInfo = {
            [StorageLocation.INTERNAL]: internalStorage.status === 'fulfilled' ? internalStorage.value : null,
            [StorageLocation.EXTERNAL]: externalStorage.status === 'fulfilled' ? externalStorage.value : null,
            [StorageLocation.REMOVABLE]: removableStorage.status === 'fulfilled' ? removableStorage.value : null,
          };

          const totalUsed = Object.values(storageInfo).reduce((sum, info) => 
            sum + (info?.usedSpace || 0), 0
          );
          const totalAvailable = Object.values(storageInfo).reduce((sum, info) => 
            sum + (info?.availableSpace || 0), 0
          );

          set({
            storageInfo,
            totalStorageUsed: totalUsed,
            totalStorageAvailable: totalAvailable,
          });
        } catch (error) {
          console.error('Failed to load storage info:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load storage info' });
        }
      },

      cleanupTempFiles: async (): Promise<number> => {
        try {
          const bytesCleared = await fileManagerService.cleanupTempFiles();
          await get().loadStorageInfo();
          return bytesCleared;
        } catch (error) {
          console.error('Failed to cleanup temp files:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to cleanup temp files' });
          return 0;
        }
      },

      // Permission management
      requestPermission: async (permission: PermissionType): Promise<PermissionResult> => {
        try {
          const result = await fileManagerService.requestPermission(permission);
          const { permissions } = get();
          set({
            permissions: {
              ...permissions,
              [permission]: result.status,
            },
          });
          return result;
        } catch (error) {
          console.error('Failed to request permission:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to request permission' });
          throw error;
        }
      },

      checkAllPermissions: async (): Promise<void> => {
        try {
          const permissionTypes = Object.values(PermissionType);
          const statusChecks = await Promise.all(
            permissionTypes.map(permission => fileManagerService.checkPermission(permission))
          );

          const permissions = permissionTypes.reduce((acc, permission, index) => ({
            ...acc,
            [permission]: statusChecks[index],
          }), {} as Record<PermissionType, PermissionStatus>);

          set({ permissions });
        } catch (error) {
          console.error('Failed to check permissions:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check permissions' });
        }
      },

      // File watching
      watchCurrentDirectory: async (): Promise<void> => {
        const { currentDirectory } = get();
        
        try {
          if (directoryWatcher) {
            await fileManagerService.unwatchDirectory(directoryWatcher.id);
          }

          directoryWatcher = await fileManagerService.watchDirectory(
            currentDirectory,
            [FileWatchEventType.CREATED, FileWatchEventType.MODIFIED, FileWatchEventType.DELETED],
            (event: FileWatchEvent) => {
              // Auto-refresh directory on changes
              setTimeout(() => get().refreshDirectory(), 1000);
            },
            false
          );

          const { fileWatchers } = get();
          set({ fileWatchers: [...fileWatchers, directoryWatcher] });
        } catch (error) {
          console.error('Failed to watch directory:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to watch directory' });
        }
      },

      stopWatchingDirectory: async (): Promise<void> => {
        if (directoryWatcher) {
          try {
            await fileManagerService.unwatchDirectory(directoryWatcher.id);
            const { fileWatchers } = get();
            set({ 
              fileWatchers: fileWatchers.filter(w => w.id !== directoryWatcher!.id)
            });
            directoryWatcher = null;
          } catch (error) {
            console.error('Failed to stop watching directory:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop watching directory' });
          }
        }
      },

      // Search and filtering
      searchFiles: async (query: string, options?: Partial<FileSearchOptions>): Promise<void> => {
        set({ isSearching: true, error: null, searchQuery: query });
        
        try {
          const { currentDirectory } = get();
          const searchOptions: FileSearchOptions = {
            directory: currentDirectory,
            recursive: true,
            namePattern: query,
            includeHidden: false,
            ...options,
          };

          const results = await fileManagerService.searchFiles(searchOptions);
          set({ 
            searchResults: results,
            isSearching: false,
          });
        } catch (error) {
          console.error('Failed to search files:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to search files',
            isSearching: false,
          });
        }
      },

      clearSearch: (): void => {
        set({ 
          searchResults: [],
          searchQuery: '',
        });
      },

      applyFilter: (filter: Partial<FileState['currentFilter']>): void => {
        const { currentFilter, files } = get();
        const newFilter = { ...currentFilter, ...filter };
        
        const filteredFiles = applyCurrentFilter(files);
        
        set({ 
          currentFilter: newFilter,
          files: filteredFiles,
        });
      },

      clearFilter: (): void => {
        set({ currentFilter: {} });
        get().refreshDirectory();
      },

      sortFiles: (sortBy: FileState['sortBy'], order: FileState['sortOrder']): void => {
        const { files } = get();
        const sortedFiles = sortFileArray(files, sortBy, order);
        
        set({ 
          files: sortedFiles,
          sortBy,
          sortOrder: order,
        });
      },

      // Video file operations
      loadVideoFiles: async (directoryPath?: string): Promise<void> => {
        try {
          const path = directoryPath || get().currentDirectory;
          const videoFiles = await fileManagerService.findVideoFiles(path, true);
          set({ videoFiles });
        } catch (error) {
          console.error('Failed to load video files:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load video files' });
        }
      },

      validateVideoFile: async (filePath: string): Promise<FileValidationResult> => {
        try {
          return await fileManagerService.validateVideoFile(filePath);
        } catch (error) {
          console.error('Failed to validate video file:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to validate video file' });
          throw error;
        }
      },

      generateThumbnail: async (videoPath: string, options?: Partial<ThumbnailOptions>): Promise<ThumbnailResult> => {
        try {
          const thumbnailOptions = { ...defaultThumbnailOptions, ...options };
          return await fileManagerService.generateThumbnail(videoPath, thumbnailOptions);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to generate thumbnail' });
          throw error;
        }
      },

      // Utility actions
      getFileInfo: async (filePath: string): Promise<FileInfo> => {
        try {
          return await fileManagerService.getFileInfo(filePath);
        } catch (error) {
          console.error('Failed to get file info:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to get file info' });
          throw error;
        }
      },

      generateUniqueFileName: async (basePath: string, fileName: string): Promise<string> => {
        try {
          return await fileManagerService.generateUniqueFileName(basePath, fileName);
        } catch (error) {
          console.error('Failed to generate unique file name:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to generate unique file name' });
          throw error;
        }
      },

      sanitizeFileName: (fileName: string): string => {
        return fileManagerService.sanitizeFileName(fileName);
      },

      // View controls
      setViewMode: (mode: 'list' | 'grid'): void => {
        set({ viewMode: mode });
      },

      // Utility actions
      clearError: (): void => {
        set({ error: null });
      },

      clearHistory: (): void => {
        set({ operationHistory: [] });
      },
    };
  })
);

// Selector hooks for easy access to specific file data
export const useCurrentDirectory = () => useFileStore((state) => state.currentDirectory);
export const useCurrentDirectoryInfo = () => useFileStore((state) => state.currentDirectoryInfo);
export const useFiles = () => useFileStore((state) => state.files);
export const useVideoFiles = () => useFileStore((state) => state.videoFiles);
export const useSelectedFiles = () => useFileStore((state) => state.selectedFiles);
export const useStorageInfo = () => useFileStore((state) => state.storageInfo);
export const usePermissions = () => useFileStore((state) => state.permissions);
export const useSearchResults = () => useFileStore((state) => state.searchResults);
export const useFileLoading = () => useFileStore((state) => state.isLoading);
export const useFileSearching = () => useFileStore((state) => state.isSearching);
export const useFileError = () => useFileStore((state) => state.error);
export const useFileViewMode = () => useFileStore((state) => state.viewMode);
export const useFileSorting = () => useFileStore((state) => ({ sortBy: state.sortBy, sortOrder: state.sortOrder }));
export const useOperationHistory = () => useFileStore((state) => state.operationHistory);