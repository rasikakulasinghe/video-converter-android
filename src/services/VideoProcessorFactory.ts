import { Platform } from 'react-native';
import { VideoProcessorService } from './VideoProcessorService';
import { Media3VideoProcessor } from './implementations/Media3VideoProcessor';
import { MockVideoProcessor } from './implementations/MockVideoProcessor';
import { ErrorLogger, ErrorSeverity } from './ErrorLogger';

/**
 * Factory for creating video processor instances
 * Handles platform-specific implementations and fallbacks
 */
export class VideoProcessorFactory {
  private static instance: VideoProcessorService | null = null;

  /**
   * Get the appropriate video processor for the current platform
   */
  static getInstance(): VideoProcessorService {
    if (this.instance) {
      return this.instance;
    }

    try {
      if (Platform.OS === 'android') {
        // Try to use Media3 for Android, fall back to mock if native module not available
        try {
          this.instance = new Media3VideoProcessor();
          console.log('VideoProcessorFactory: Using Media3VideoProcessor');
        } catch (nativeError) {
          // Native module not available - use mock processor
          this.instance = new MockVideoProcessor();
          console.warn('VideoProcessorFactory: Media3 native module not found, using MockVideoProcessor for development');
          ErrorLogger.logError(
            'VideoProcessorFactory',
            'Media3 native module not available, using mock processor',
            nativeError as Error,
            ErrorSeverity.LOW
          );
        }
      } else if (Platform.OS === 'web' || Platform.OS === 'ios') {
        // Use mock processor for web and iOS (graceful degradation)
        // Web: Video processing requires native capabilities
        // iOS: AVFoundation processor not yet implemented
        this.instance = new MockVideoProcessor();
        ErrorLogger.logError(
          'VideoProcessorFactory',
          `Video processing not available on ${Platform.OS}, using mock processor`,
          new Error('Platform not supported'),
          ErrorSeverity.MEDIUM
        );
      } else {
        // Unknown platform fallback
        this.instance = new MockVideoProcessor();
        ErrorLogger.logError(
          'VideoProcessorFactory',
          `Unknown platform ${Platform.OS}, using mock processor`,
          new Error('Unknown platform'),
          ErrorSeverity.HIGH
        );
      }

      return this.instance;
    } catch (error) {
      ErrorLogger.logError('VideoProcessorFactory', 'Unexpected error during initialization', error as Error, ErrorSeverity.MEDIUM);

      // Fallback to mock processor on any initialization error
      this.instance = new MockVideoProcessor();
      return this.instance;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static async reset(): Promise<void> {
    if (this.instance && 'destroy' in this.instance && typeof (this.instance as any).destroy === 'function') {
      await (this.instance as any).destroy();
    }
    this.instance = null;
  }

  /**
   * Check if video processing is available on the current platform
   */
  static isAvailable(): boolean {
    try {
      this.getInstance();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the name of the current video processor implementation
   */
  static getImplementationName(): string {
    try {
      const instance = this.getInstance();
      if (instance instanceof Media3VideoProcessor) {
        return 'Media3VideoProcessor';
      }
      return 'Unknown';
    } catch (error) {
      return 'None';
    }
  }
}