import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
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
  CompressionLevel,
} from '../../types/models';
import { DeviceCapabilities, ThermalState } from '../../types/models/DeviceCapabilities';

// Native module interface
interface Media3VideoProcessorNative {
  convertVideo(sessionId: string, config: Media3ConversionConfig): Promise<string>;
  analyzeVideo(filePath: string): Promise<Media3AnalysisResult>;
  cancelConversion(sessionId: string): Promise<boolean>;
  getCapabilities(): Promise<Media3Capabilities>;

  // Constants
  EVENT_CONVERSION_PROGRESS: string;
  EVENT_CONVERSION_COMPLETE: string;
  EVENT_CONVERSION_ERROR: string;
  EVENT_ANALYSIS_COMPLETE: string;
}

// Media3-specific types
interface Media3ConversionConfig {
  inputPath: string;
  outputPath: string;
  quality?: {
    width: number;
    height: number;
    bitrate?: number;
    frameRate?: number;
  };
  trim?: {
    startTime: number;
    endTime: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  preserveAudio?: boolean;
}

interface Media3AnalysisResult {
  isValid: boolean;
  metadata: {
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    frameRate: number;
    codec: string;
    codecName: string;
  };
  supportedFormats: string[];
  recommendedQuality: string;
  estimatedProcessingTime: number;
}

interface Media3Capabilities {
  supportedInputFormats: string[];
  supportedOutputFormats: string[];
  supportedQualities: string[];
  supportsHardwareAcceleration: boolean;
  supportsHDR: boolean;
  maxConcurrentSessions: number;
}

interface Media3ProgressEvent {
  sessionId: string;
  progress: number;
  timestamp: number;
}

interface Media3CompleteEvent {
  sessionId: string;
  duration: number;
  fileSize: number;
  timestamp: number;
}

interface Media3ErrorEvent {
  sessionId: string;
  error: string;
  errorType: string;
  timestamp: number;
}

/**
 * Media3-based implementation of VideoProcessorService
 * Uses Google's Media3 Transformer for hardware-accelerated video processing
 */
export class Media3VideoProcessor implements VideoProcessorService {
  private nativeModule: Media3VideoProcessorNative;
  private eventEmitter: NativeEventEmitter;
  private activeSessions: Map<string, ConversionSession> = new Map();
  private eventListeners: Map<string, (event: ConversionEvent) => void> = new Map();
  private deviceCapabilities: DeviceCapabilities = this.getDefaultCapabilities();

  constructor() {
    if (Platform.OS !== 'android') {
      throw new Error('Media3VideoProcessor is only available on Android');
    }

    this.nativeModule = NativeModules['Media3VideoProcessor'];
    if (!this.nativeModule) {
      throw new Error('Media3VideoProcessor native module not found');
    }

    this.eventEmitter = new NativeEventEmitter(NativeModules['Media3VideoProcessor']);
    this.setupEventListeners();
    this.initializeDeviceCapabilities();
  }

  private setupEventListeners(): void {
    this.eventEmitter.addListener(
      this.nativeModule.EVENT_CONVERSION_PROGRESS,
      this.handleProgressEvent.bind(this)
    );

    this.eventEmitter.addListener(
      this.nativeModule.EVENT_CONVERSION_COMPLETE,
      this.handleCompleteEvent.bind(this)
    );

    this.eventEmitter.addListener(
      this.nativeModule.EVENT_CONVERSION_ERROR,
      this.handleErrorEvent.bind(this)
    );
  }

  private async initializeDeviceCapabilities(): Promise<void> {
    try {
      const capabilities = await this.nativeModule.getCapabilities();
      // Use default capabilities and update based on native capabilities
      this.deviceCapabilities = {
        ...this.getDefaultCapabilities(),
        performance: {
          benchmark: capabilities.supportsHardwareAcceleration ? 85 : 65,
          videoProcessingScore: capabilities.supportsHardwareAcceleration ? 90 : 70,
          thermalEfficiency: 80,
          batteryEfficiency: 75,
        },
      };
    } catch (error) {
      console.warn('Failed to initialize device capabilities:', error);
      this.deviceCapabilities = this.getDefaultCapabilities();
    }
  }

  private getDefaultCapabilities(): DeviceCapabilities {
    return {
      id: 'default-device',
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
        totalRam: 4096 * 1024 * 1024, // 4GB in bytes
        availableRam: 2048 * 1024 * 1024, // 2GB in bytes
        usedRam: 2048 * 1024 * 1024, // 2GB in bytes
        totalStorage: 64000 * 1024 * 1024, // 64GB in bytes
        availableStorage: 32000 * 1024 * 1024, // 32GB in bytes
        usedStorage: 32000 * 1024 * 1024, // 32GB in bytes
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
        benchmark: 75,
        videoProcessingScore: 80,
        thermalEfficiency: 85,
        batteryEfficiency: 80,
      },
    };
  }

  async createSession(request: ConversionRequest): Promise<ConversionSession> {
    const sessionId = this.generateSessionId();

    const session: ConversionSession = {
      id: sessionId,
      request,
      state: SessionState.CREATED,
      progress: {
        percentage: 0,
        processedDuration: 0,
        totalDuration: request.inputFile.metadata.duration,
        estimatedTimeRemaining: 0,
        currentPhase: 'created',
        processingSpeed: 0,
      },
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

    try {
      const config = this.createMedia3Config(session.request);
      await this.nativeModule.convertVideo(sessionId, config);

      session.state = SessionState.PROCESSING;
      session.progress.currentPhase = 'processing';
      session.startedAt = new Date();
    } catch (error) {
      session.state = SessionState.FAILED;
      session.error = new ProcessingError(
        ProcessingErrorType.UNKNOWN_ERROR,
        `Failed to start conversion: ${(error as Error).message}`,
        'PROCESSING_FAILED'
      );
      throw session.error;
    }
  }

  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
    try {
      const result = await this.nativeModule.analyzeVideo(filePath);

      return {
        isValid: result.isValid,
        metadata: result.metadata,
        supportedFormats: result.supportedFormats.map(this.mapToOutputFormat),
        recommendedQuality: this.mapToVideoQuality(result.recommendedQuality),
        estimatedProcessingTime: result.estimatedProcessingTime,
        complexity: 'medium',
        issues: [],
      };
    } catch (error) {
      throw new ProcessingError(
        ProcessingErrorType.UNKNOWN_ERROR,
        `Video analysis failed: ${(error as Error).message}`,
        'ANALYSIS_FAILED',
        { filePath, originalError: error }
      );
    }
  }

  async pauseConversion(sessionId: string): Promise<void> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Pause/resume is not supported by Media3 Transformer',
      'OPERATION_NOT_SUPPORTED',
      { sessionId }
    );
  }

  async resumeConversion(sessionId: string): Promise<void> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Pause/resume is not supported by Media3 Transformer',
      'OPERATION_NOT_SUPPORTED',
      { sessionId }
    );
  }

  async cancelConversion(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new ProcessingError(
          ProcessingErrorType.SESSION_NOT_FOUND,
          'Session not found',
          'SESSION_NOT_FOUND'
        );
      }

      const cancelled = await this.nativeModule.cancelConversion(sessionId);
      if (cancelled) {
        session.state = SessionState.CANCELLED;
        session.completedAt = new Date();
        // Keep session in map so status can be queried after cancellation
      }
    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError(
        ProcessingErrorType.UNKNOWN_ERROR,
        `Failed to cancel conversion: ${(error as Error).message}`,
        'CANCELLATION_FAILED'
      );
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
    try {
      const capabilities = await this.nativeModule.getCapabilities();
      return capabilities.supportedOutputFormats.map(this.mapToOutputFormat);
    } catch (error) {
      return [OutputFormat.MP4]; // Fallback to MP4 only
    }
  }

  async getQualityProfiles(): Promise<QualityProfile[]> {
    return [
      {
        quality: VideoQuality.LOW,
        width: 640,
        height: 360,
        bitrate: 500000,
        frameRate: 30,
        codecProfile: 'baseline',
        description: 'Low quality (360p)',
      },
      {
        quality: VideoQuality.SD,
        width: 854,
        height: 480,
        bitrate: 1000000,
        frameRate: 30,
        codecProfile: 'main',
        description: 'Standard definition (480p)',
      },
      {
        quality: VideoQuality.HD,
        width: 1280,
        height: 720,
        bitrate: 2500000,
        frameRate: 30,
        codecProfile: 'high',
        description: 'High definition (720p)',
      },
      {
        quality: VideoQuality.FULL_HD,
        width: 1920,
        height: 1080,
        bitrate: 5000000,
        frameRate: 30,
        codecProfile: 'high',
        description: 'Full HD (1080p)',
      },
    ];
  }

  async getConversionPresets(): Promise<ConversionPreset[]> {
    return [
      {
        id: 'fast',
        name: 'Fast Conversion',
        description: 'Optimized for speed',
        quality: VideoQuality.HD,
        format: OutputFormat.MP4,
        processingArgs: ['-preset', 'fast'],
        speedMultiplier: 1.5,
        minCapabilityScore: 0.5,
      },
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Balance between speed and quality',
        quality: VideoQuality.HD,
        format: OutputFormat.MP4,
        processingArgs: ['-preset', 'medium'],
        speedMultiplier: 1.0,
        minCapabilityScore: 0.6,
      },
      {
        id: 'quality',
        name: 'High Quality',
        description: 'Optimized for quality',
        quality: VideoQuality.FULL_HD,
        format: OutputFormat.MP4,
        processingArgs: ['-preset', 'slow'],
        speedMultiplier: 0.7,
        minCapabilityScore: 0.8,
      },
    ];
  }

  async estimateProcessingTime(request: ConversionRequest, deviceCapabilities: DeviceCapabilities): Promise<number> {
    const baseDuration = request.inputFile.metadata.duration;
    const complexityMultiplier = this.getComplexityMultiplier(request);
    const deviceMultiplier = 1 / Math.max(deviceCapabilities.processor.cores / 4, 0.5);

    return Math.round(baseDuration * complexityMultiplier * deviceMultiplier);
  }

  async estimateOutputSize(request: ConversionRequest): Promise<number> {
    const inputSize = request.inputFile.size;
    const qualityMultiplier = this.getQualityMultiplierFromSettings(request.settings);

    return Math.round(inputSize * qualityMultiplier);
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
    return this.deviceCapabilities;
  }

  async validateRequest(request: ConversionRequest): Promise<ValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!request.inputFile?.path) {
        errors.push('Input file path is required');
      }

      if (!request.outputPath) {
        errors.push('Output path is required');
      }

      if (request.inputFile?.metadata?.duration > 3600000) { // 1 hour
        warnings.push('Video duration exceeds recommended limit (1 hour)');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${(error as Error).message}`],
        warnings: [],
      };
    }
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
      'Custom quality profiles not implemented yet',
      'OPERATION_NOT_SUPPORTED',
      { settings }
    );
  }

  async createConversionPreset(name: string, settings: any): Promise<ConversionPreset> {
    throw new ProcessingError(
      ProcessingErrorType.INVALID_OPERATION,
      'Custom conversion presets not implemented yet',
      'OPERATION_NOT_SUPPORTED',
      { name, settings }
    );
  }


  // Event handlers
  private handleProgressEvent(event: Media3ProgressEvent): void {
    const session = this.activeSessions.get(event.sessionId);
    if (!session) return;

    session.progress.percentage = Math.round(event.progress * 100);
    session.progress.currentPhase = 'processing';

    const conversionEvent: ConversionEvent = {
      type: ConversionEventType.PROGRESS_UPDATE,
      sessionId: event.sessionId,
      data: { progress: session.progress },
      timestamp: new Date(event.timestamp),
    };

    this.notifyListeners(conversionEvent);
  }

  private handleCompleteEvent(event: Media3CompleteEvent): void {
    const session = this.activeSessions.get(event.sessionId);
    if (!session) return;

    session.state = SessionState.COMPLETED;
    session.completedAt = new Date(event.timestamp);
    session.progress.percentage = 100;
    session.progress.currentPhase = 'completed';

    // Create output file metadata
    const outputFile: VideoFile = {
      id: `output_${event.sessionId}`,
      name: session.request.outputPath.split('/').pop() || 'converted_video.mp4',
      path: session.request.outputPath,
      size: event.fileSize,
      mimeType: 'video/mp4',
      format: VideoFormat.MP4,
      createdAt: new Date(),
      modifiedAt: new Date(),
      metadata: {
        duration: event.duration,
        width: session.request.inputFile.metadata.width,
        height: session.request.inputFile.metadata.height,
        frameRate: session.request.inputFile.metadata.frameRate,
        bitrate: session.request.inputFile.metadata.bitrate,
        codec: 'h264',
        codecName: 'H.264',
      },
    };

    const processingTime = (event.timestamp - session.createdAt.getTime()) / 1000; // in seconds

    session.result = {
      success: true,
      outputFile,
      processingTime,
      finalProgress: {
        percentage: 100,
        currentFrame: 0,
        totalFrames: 0,
        processedDuration: event.duration,
        totalDuration: session.request.inputFile.metadata.duration,
        estimatedTimeRemaining: 0,
        currentBitrate: 0,
        averageFps: 0,
      },
      completedAt: new Date(event.timestamp),
      compressionRatio: session.request.inputFile.size / event.fileSize,
    };

    const conversionEvent: ConversionEvent = {
      type: ConversionEventType.CONVERSION_COMPLETED,
      sessionId: event.sessionId,
      data: { result: session.result },
      timestamp: new Date(event.timestamp),
    };

    this.notifyListeners(conversionEvent);
    this.activeSessions.delete(event.sessionId);
  }

  private handleErrorEvent(event: Media3ErrorEvent): void {
    const session = this.activeSessions.get(event.sessionId);
    if (!session) return;

    session.state = SessionState.FAILED;
    session.error = new ProcessingError(
      ProcessingErrorType.UNKNOWN_ERROR,
      event.error,
      'PROCESSING_FAILED',
      { errorType: event.errorType }
    );
    session.completedAt = new Date(event.timestamp);

    const conversionEvent: ConversionEvent = {
      type: ConversionEventType.CONVERSION_FAILED,
      sessionId: event.sessionId,
      data: { error: session.error },
      timestamp: new Date(event.timestamp),
    };

    this.notifyListeners(conversionEvent);
    this.activeSessions.delete(event.sessionId);
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

  private createMedia3Config(request: ConversionRequest): Media3ConversionConfig {
    const config: Media3ConversionConfig = {
      inputPath: request.inputFile.path,
      outputPath: request.outputPath,
    };

    // Map quality settings from ConversionSettings
    config.quality = {
      width: request.settings.maxWidth,
      height: request.settings.maxHeight,
    };

    // Preserve audio by default
    config.preserveAudio = true;

    return config;
  }

  private getQualityDimensions(quality: VideoQuality): { width: number; height: number } {
    switch (quality) {
      case VideoQuality.LOW:
        return { width: 640, height: 360 };
      case VideoQuality.SD:
        return { width: 854, height: 480 };
      case VideoQuality.HD:
        return { width: 1280, height: 720 };
      case VideoQuality.FULL_HD:
        return { width: 1920, height: 1080 };
      case VideoQuality.UHD_4K:
        return { width: 3840, height: 2160 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  private mapToOutputFormat(format: string): OutputFormat {
    switch (format.toLowerCase()) {
      case 'mp4':
        return OutputFormat.MP4;
      case 'mov':
        return OutputFormat.MOV;
      case 'avi':
        return OutputFormat.AVI;
      case 'mkv':
        return OutputFormat.MKV;
      default:
        return OutputFormat.MP4;
    }
  }

  private getComplexityMultiplier(request: ConversionRequest): number {
    // Base complexity multiplier
    return 1.0;
  }

  private getQualityMultiplier(quality: VideoQuality): number {
    switch (quality) {
      case VideoQuality.LOW:
        return 0.3;
      case VideoQuality.SD:
        return 0.5;
      case VideoQuality.HD:
        return 0.8;
      case VideoQuality.FULL_HD:
        return 1.0;
      case VideoQuality.UHD_4K:
        return 2.0;
      default:
        return 0.8;
    }
  }

  private getQualityMultiplierFromSettings(settings: ConversionSettings): number {
    // Estimate based on target bitrate and compression
    const baseBitrate = 2000000; // 2 Mbps baseline
    const bitrateRatio = settings.targetBitrate / baseBitrate;

    // Adjust based on compression level
    const compressionMultiplier = settings.compression === CompressionLevel.HIGH ? 0.7 :
                                  settings.compression === CompressionLevel.MEDIUM ? 0.85 :
                                  settings.compression === CompressionLevel.LOW ? 1.0 : 0.85;

    return bitrateRatio * compressionMultiplier;
  }

  private mapToVideoQuality(quality: string): VideoQuality {
    switch (quality) {
      case '360p':
        return VideoQuality.LOW;
      case '480p':
        return VideoQuality.SD;
      case '720p':
        return VideoQuality.HD;
      case '1080p':
        return VideoQuality.FULL_HD;
      case '2160p':
        return VideoQuality.UHD_4K;
      default:
        return VideoQuality.HD;
    }
  }

  private generateSessionId(): string {
    return `media3_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.eventEmitter.removeAllListeners(this.nativeModule.EVENT_CONVERSION_PROGRESS);
    this.eventEmitter.removeAllListeners(this.nativeModule.EVENT_CONVERSION_COMPLETE);
    this.eventEmitter.removeAllListeners(this.nativeModule.EVENT_CONVERSION_ERROR);
    this.eventListeners.clear();
    this.activeSessions.clear();
  }
}