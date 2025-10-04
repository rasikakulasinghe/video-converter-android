import { Platform } from 'react-native';
import { FileManagerService } from './FileManagerService';
import { MockFileManager } from './implementations/MockFileManager';
import { ErrorLogger, ErrorSeverity } from './ErrorLogger';

/**
 * Factory for creating file manager instances
 * Handles platform-specific implementations and fallbacks
 */
export class FileManagerFactory {
  private static instance: FileManagerService | null = null;

  /**
   * Get the appropriate file manager for the current platform
   */
  static getInstance(): FileManagerService {
    if (this.instance) {
      return this.instance;
    }

    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Dynamically import ReactNativeFileManager only on native platforms
        // This prevents react-native-fs from being imported on web
        const { ReactNativeFileManager } = require('./implementations/ReactNativeFileManager');
        this.instance = new ReactNativeFileManager();
        return this.instance;
      } else if (Platform.OS === 'web') {
        // Use mock file manager for web (no native file system access)
        this.instance = new MockFileManager();
        ErrorLogger.logError(
          'FileManagerFactory',
          'File system operations not available on web, using mock manager',
          new Error('Platform not supported'),
          ErrorSeverity.MEDIUM
        );
        return this.instance;
      } else {
        // Unknown platform fallback
        this.instance = new MockFileManager();
        ErrorLogger.logError(
          'FileManagerFactory',
          `Unknown platform ${Platform.OS}, using mock file manager`,
          new Error('Unknown platform'),
          ErrorSeverity.HIGH
        );
        return this.instance;
      }
    } catch (error) {
      ErrorLogger.logCritical('FileManagerFactory', 'Failed to initialize file manager', error);

      // Fallback to mock file manager on any initialization error
      this.instance = new MockFileManager();
      return this.instance;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Check if native file operations are available on the current platform
   */
  static isNativeAvailable(): boolean {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  /**
   * Get the name of the current file manager implementation
   */
  static getImplementationName(): string {
    try {
      const instance = this.getInstance();
      if (instance instanceof MockFileManager) {
        return 'MockFileManager';
      }
      // Check by platform since we can't import ReactNativeFileManager on web
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return 'ReactNativeFileManager';
      }
      return 'Unknown';
    } catch (error) {
      return 'None';
    }
  }
}
