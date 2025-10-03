import {
  VideoProcessorService,
  ConversionProgress as ServiceConversionProgress,
  ConversionSession,
  SessionState,
  ProcessingError,
  ProcessingErrorType,
  ProcessingOptions,
  ConversionStatistics,
  VideoAnalysisResult,
  QualityProfile,
  ConversionPreset,
  ValidationResult,
  ConversionEvent,
  ConversionEventType,
} from '../VideoProcessorService';
import {
  VideoFile,
  ConversionRequest,
  ConversionResult,
  VideoQuality,
  OutputFormat,
  ConversionStatus,
  ConversionProgress,
  VideoFormat,
  ErrorSeverity,
  ConversionSettings,
} from '../../types/models';
import { DeviceCapabilities, ThermalState } from '../../types/models/DeviceCapabilities';

/**
 * Mock video processor for unsupported platforms (web, iOS) or when native module is unavailable
 * Provides graceful degradation when native video processing is unavailable
 */
export class MockVideoProcessor implements VideoProcessorService {
  private activeSessions: Map<string, ConversionSession> = new Map();
  private eventListeners: Map<string, (event: ConversionEvent) => void> = new Map();

  /**
   * Creates a mock conversion session that immediately fails with helpful error
   */
  async createSession(request: ConversionRequest): Promise<ConversionSession> {
    const sessionId = this.generateSessionId();

    const session: ConversionSession = {
      id: sessionId,
      request,
      state: SessionState.FAILED,
      progress: {
        percentage: 0,
        processedDuration: 0,
        totalDuration: request.inputFile.metadata.duration,
        estimatedTimeRemaining: 0,
        currentPhase: 'created',
        processingSpeed: 0,
      },
      error: new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        'Video processing is not available. Native module not found. Please rebuild the app with native modules.',
        'NATIVE_MODULE_NOT_FOUND'
      ),
      createdAt: new Date(),
      statistics: {
        startTime: new Date(),
        bytesProcessed: 0,
        framesProcessed: 0,
        averageSpeed: 0,
        peakMemoryUsage: 0,
        cpuUsage: 0,
      },
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  async startConversion(sessionId: string, options: ProcessingOptions): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        'Conversion session not found',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }

    // Emit error immediately
    const conversionEvent: ConversionEvent = {
      type: ConversionEventType.CONVERSION_FAILED,
      sessionId: sessionId,
      data: { error: session.error },
      timestamp: new Date(),
    };

    this.notifyListeners(conversionEvent);
  }

  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Video analysis is not available on this platform',
      'OPERATION_NOT_SUPPORTED'
    );
  }

  async pauseConversion(sessionId: string): Promise<void> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Video processing is not available on this platform',
      'OPERATION_NOT_SUPPORTED'
    );
  }

  async resumeConversion(sessionId: string): Promise<void> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Video processing is not available on this platform',
      'OPERATION_NOT_SUPPORTED'
    );
  }

  async cancelConversion(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.state = SessionState.CANCELLED;
      this.activeSessions.delete(sessionId);
    }
  }

  async getSessionStatus(sessionId: string): Promise<ConversionSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        'Conversion session not found',
        'SESSION_NOT_FOUND',
        { sessionId }
      );
    }
    return session;
  }

  async getSupportedFormats(deviceCapabilities?: DeviceCapabilities): Promise<OutputFormat[]> {
    return [];
  }

  async getQualityProfiles(): Promise<QualityProfile[]> {
    return [];
  }

  async getConversionPresets(): Promise<ConversionPreset[]> {
    return [];
  }

  async estimateProcessingTime(request: ConversionRequest, deviceCapabilities: DeviceCapabilities): Promise<number> {
    return 0;
  }

  async estimateOutputSize(request: ConversionRequest): Promise<number> {
    return 0;
  }

  async cleanup(sessionId?: string): Promise<void> {
    if (sessionId) {
      this.activeSessions.delete(sessionId);
    } else {
      this.activeSessions.clear();
    }
  }

  getActiveConversions(): ConversionSession[] {
    return Array.from(this.activeSessions.values());
  }

  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    return this.getDefaultCapabilities();
  }

  async validateRequest(request: ConversionRequest): Promise<ValidationResult> {
    return {
      isValid: false,
      errors: ['Video processing is not available on this platform'],
      warnings: ['Native module not found'],
    };
  }

  addEventListener(eventType: ConversionEventType, listener: (event: ConversionEvent) => void): string {
    const listenerId = this.generateSessionId();
    this.eventListeners.set(listenerId, listener);
    return listenerId;
  }

  removeEventListener(listenerId: string): void {
    this.eventListeners.delete(listenerId);
  }

  async createQualityProfile(settings: any): Promise<QualityProfile> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Video processing is not available on this platform',
      'OPERATION_NOT_SUPPORTED'
    );
  }

  async createConversionPreset(name: string, settings: any): Promise<ConversionPreset> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Video processing is not available on this platform',
      'OPERATION_NOT_SUPPORTED'
    );
  }

  private notifyListeners(event: ConversionEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  private generateSessionId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getDefaultCapabilities(): DeviceCapabilities {
    return {
      id: 'mock-device',
      deviceModel: 'Unknown',
      androidVersion: '11.0',
      apiLevel: 30,
      architecture: 'arm64-v8a',
      lastUpdated: new Date(),
      battery: {
        level: 0.8,
        isCharging: false,
        health: 'good',
        temperature: 25.0,
        voltage: 4.0,
        capacity: 4000,
      },
      memory: {
        totalRam: 4096 * 1024 * 1024,
        availableRam: 2048 * 1024 * 1024,
        usedRam: 2048 * 1024 * 1024,
        totalStorage: 64000 * 1024 * 1024,
        availableStorage: 32000 * 1024 * 1024,
        usedStorage: 32000 * 1024 * 1024,
        isLowMemory: false,
      },
      thermal: {
        state: ThermalState.NORMAL,
        temperature: 25.0,
        throttleLevel: 0,
        maxSafeTemperature: 85.0,
      },
      processor: {
        cores: 8,
        maxFrequency: 2400,
        currentFrequency: 1800,
        usage: 30,
        architecture: 'arm64-v8a',
      },
      performance: {
        benchmark: 0,
        videoProcessingScore: 0,
        thermalEfficiency: 0,
        batteryEfficiency: 0,
      },
    };
  }
}
