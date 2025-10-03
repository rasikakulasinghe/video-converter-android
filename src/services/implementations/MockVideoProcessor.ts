import { VideoProcessorService, ConversionRequest, ConversionSession } from '../VideoProcessorService';

/**
 * Mock video processor for unsupported platforms (web, iOS)
 * Provides graceful degradation when native video processing is unavailable
 */
export class MockVideoProcessor implements VideoProcessorService {
  /**
   * Creates a mock conversion session that immediately fails with helpful error
   */
  async createSession(request: ConversionRequest): Promise<ConversionSession> {
    const session: ConversionSession = {
      sessionId: `mock-${Date.now()}`,
      inputFile: request.inputFile,
      outputSettings: request.outputSettings,
      status: 'failed',
      progress: 0,
      error: 'Video processing is not available on this platform. Please use an Android device.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return session;
  }

  /**
   * Mock start - immediately returns as session is already failed
   */
  async startConversion(sessionId: string): Promise<void> {
    // No-op: Session already marked as failed
    return Promise.resolve();
  }

  /**
   * Mock pause - not supported
   */
  async pauseConversion(sessionId: string): Promise<void> {
    throw new Error('Video processing is not available on this platform');
  }

  /**
   * Mock resume - not supported
   */
  async resumeConversion(sessionId: string): Promise<void> {
    throw new Error('Video processing is not available on this platform');
  }

  /**
   * Mock cancel - not supported
   */
  async cancelConversion(sessionId: string): Promise<void> {
    // No-op: Nothing to cancel
    return Promise.resolve();
  }

  /**
   * Mock session retrieval - returns null
   */
  async getSession(sessionId: string): Promise<ConversionSession | null> {
    return null;
  }

  /**
   * Mock cleanup - no-op
   */
  async cleanup(sessionId: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Check if video processing is available (always false for mock)
   */
  isAvailable(): boolean {
    return false;
  }

  /**
   * Get supported formats (empty for mock)
   */
  getSupportedFormats(): string[] {
    return [];
  }
}
