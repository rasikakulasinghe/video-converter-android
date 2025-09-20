import { Platform } from 'react-native';
import { VideoProcessorService } from './VideoProcessorService';
import { Media3VideoProcessor } from './implementations/Media3VideoProcessor';

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
        // Use Media3 for Android
        this.instance = new Media3VideoProcessor();
        console.log('Using Media3VideoProcessor for Android');
      } else {
        // For iOS, we would need to implement AVFoundation-based processor
        // For now, throw an error
        throw new Error('iOS video processing not implemented yet');
      }

      return this.instance;
    } catch (error) {
      console.error('Failed to initialize video processor:', error);

      // In the future, you could add fallback logic here
      // For example, falling back to a cloud-based processing service
      // or a simple file manipulation service

      throw new Error(
        `Video processing is not available on this platform: ${(error as Error).message}`
      );
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