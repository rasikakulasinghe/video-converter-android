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
  FFmpegCommand,
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
      this.deviceCapabilities = {
        processingPower: capabilities.supportsHardwareAcceleration ? 'high' : 'medium',
        availableMemory: 1000, // MB - would need device-specific detection
        thermalState: ThermalState.NORMAL,
        supportedCodecs: capabilities.supportedInputFormats,
        hardwareAcceleration: capabilities.supportsHardwareAcceleration,
        maxConcurrentSessions: capabilities.maxConcurrentSessions,
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
        chargingStatus: 'unknown',
      },
      memory: {
        totalRAM: 4096,
        availableRAM: 2048,
        usedRAM: 2048,
        totalStorage: 64000,
        availableStorage: 32000,
        usedStorage: 32000,
        lowMemoryThreshold: 512,
      },
      thermal: {
        state: ThermalState.NORMAL,
        temperature: 25.0,
        throttleLevel: 0,
        coolingTimeEstimate: 0,
      },
      processor: {
        cores: 8,
        maxFrequency: 2400,
        currentFrequency: 1800,
        usage: 30,
        architecture: 'arm64-v8a',
      },
      network: {
        isConnected: true,
        type: 'wifi',
        strength: 80,
        isMetered: false,
        uploadSpeed: 10000000,
        downloadSpeed: 50000000,
        latency: 20,
      },
      graphics: {
        vendor: 'Qualcomm',
        renderer: 'Adreno',
        version: '6.0',
        supportsHardwareAcceleration: true,
        maxTextureSize: 4096,
        shaderVersion: '320 es',
      },
      storage: {
        totalInternal: 64000,
        availableInternal: 32000,
        totalExternal: undefined,
        availableExternal: undefined,
      },
      optimizationPreferences: {
        preferQuality: false,
        preferSpeed: true,
        enableHardwareAcceleration: true,
        maxConcurrentOperations: 2,
        thermalThrottlingEnabled: true,
        batteryOptimizationEnabled: true,
        networkOptimizationEnabled: false,
      },
    };
  }

  async startConversion(request: ConversionRequest): Promise<string> {
    const sessionId = this.generateSessionId();

    const session: ConversionSession = {
      id: sessionId,
      request,
      state: SessionState.INITIALIZING,
      progress: {
        percentage: 0,
        processedDuration: 0,
        totalDuration: request.inputFile.metadata.duration,
        estimatedTimeRemaining: 0,
        currentPhase: 'initializing',
      },
      createdAt: new Date(),
      statistics: {
        startTime: new Date(),
        processingSpeed: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        thermalState: ThermalState.NORMAL,
      },
    };

    this.activeSessions.set(sessionId, session);

    try {
      const config = this.createMedia3Config(request);
      await this.nativeModule.convertVideo(sessionId, config);

      session.state = SessionState.PROCESSING;
      session.progress.currentPhase = 'processing';

      return sessionId;
    } catch (error) {
      session.state = SessionState.FAILED;
      session.error = new ProcessingError(
        ProcessingErrorType.PROCESSING_FAILED,
        `Failed to start conversion: ${error.message}`,
        { originalError: error }
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
        supportedFormats: result.supportedFormats.map(this.mapToVideoFormat),
        recommendedQuality: this.mapToVideoQuality(result.recommendedQuality),
        estimatedProcessingTime: result.estimatedProcessingTime,
        deviceOptimizations: {
          preferredEncoder: 'hardware',
          maxRecommendedResolution: { width: 1920, height: 1080 },
          thermalThrottling: false,
        },
      };
    } catch (error) {
      throw new ProcessingError(
        ProcessingErrorType.ANALYSIS_FAILED,
        `Video analysis failed: ${error.message}`,
        { filePath, originalError: error }
      );
    }
  }

  async pauseConversion(sessionId: string): Promise<void> {
    // Media3 doesn't support pausing, so we'll need to implement stop/resume pattern
    throw new ProcessingError(
      ProcessingErrorType.OPERATION_NOT_SUPPORTED,
      'Pause/resume is not supported by Media3 Transformer',
      { sessionId }
    );
  }

  async resumeConversion(sessionId: string): Promise<void> {
    // Media3 doesn't support pausing, so we'll need to implement stop/resume pattern
    throw new ProcessingError(
      ProcessingErrorType.OPERATION_NOT_SUPPORTED,
      'Pause/resume is not supported by Media3 Transformer',
      { sessionId }
    );
  }

  async cancelConversion(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const cancelled = await this.nativeModule.cancelConversion(sessionId);
      if (cancelled) {
        session.state = SessionState.CANCELLED;
        session.completedAt = new Date();
        this.activeSessions.delete(sessionId);
      }
    } catch (error) {
      throw new ProcessingError(
        ProcessingErrorType.CANCELLATION_FAILED,
        `Failed to cancel conversion: ${error.message}`,
        { sessionId, originalError: error }
      );
    }
  }

  async getConversionProgress(sessionId: string): Promise<ServiceConversionProgress> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        'Conversion session not found',
        { sessionId }
      );
    }

    return session.progress;
  }

  async getConversionResult(sessionId: string): Promise<ConversionResult | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.result) {
      return null;
    }

    return session.result;
  }

  getActiveConversions(): ConversionSession[] {
    return Array.from(this.activeSessions.values());
  }

  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    return this.deviceCapabilities;
  }

  async validateConversionRequest(request: ConversionRequest): Promise<ValidationResult> {
    try {
      // Basic validation
      const errors: string[] = [];

      if (!request.inputFile?.path) {
        errors.push('Input file path is required');
      }

      if (!request.outputPath) {
        errors.push('Output path is required');
      }

      if (request.inputFile?.metadata?.duration > 3600000) { // 1 hour
        errors.push('Video duration exceeds maximum limit (1 hour)');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        recommendations: ['Use hardware acceleration for better performance'],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: [],
        recommendations: [],
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
    // Implement quality profile creation based on Media3 capabilities
    throw new ProcessingError(
      ProcessingErrorType.OPERATION_NOT_SUPPORTED,
      'Custom quality profiles not implemented yet',
      { settings }
    );
  }

  async createConversionPreset(name: string, settings: any): Promise<ConversionPreset> {
    // Implement conversion preset creation
    throw new ProcessingError(
      ProcessingErrorType.OPERATION_NOT_SUPPORTED,
      'Custom conversion presets not implemented yet',
      { name, settings }
    );
  }

  async executeCommand(command: FFmpegCommand): Promise<any> {
    // Media3 doesn't use FFmpeg commands, so this is not applicable
    throw new ProcessingError(
      ProcessingErrorType.OPERATION_NOT_SUPPORTED,
      'FFmpeg commands are not supported by Media3 implementation',
      { command }
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

    session.result = {
      id: event.sessionId,
      request: session.request,
      status: ConversionStatus.COMPLETED,
      progress: {
        percentage: 100,
        currentFrame: 0,
        totalFrames: 0,
        processedDuration: event.duration,
        totalDuration: session.request.inputFile.metadata.duration,
        estimatedTimeRemaining: 0,
        currentBitrate: 0,
        averageFps: 0,
      },
      startTime: session.createdAt,
      endTime: new Date(event.timestamp),
      outputFile,
      stats: {
        compressionRatio: session.request.inputFile.size / event.fileSize,
        processingDuration: event.timestamp - session.createdAt.getTime(),
        averageSpeed: event.duration / (event.timestamp - session.createdAt.getTime()),
      },
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
      ProcessingErrorType.PROCESSING_FAILED,
      event.error,
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

    // Map quality settings
    if (request.targetQuality) {
      const dimensions = this.getQualityDimensions(request.targetQuality);
      config.quality = {
        width: dimensions.width,
        height: dimensions.height,
      };
    }

    // Map options
    if (request.options) {
      if (request.options.startTime !== undefined && request.options.endTime !== undefined) {
        config.trim = {
          startTime: request.options.startTime / 1000, // Convert to seconds
          endTime: request.options.endTime / 1000,
        };
      }

      if (request.options.cropParams) {
        config.crop = request.options.cropParams;
      }

      config.preserveAudio = request.options.preserveAudio ?? true;
    }

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

  private mapToVideoFormat(format: string): VideoFormat {
    switch (format.toLowerCase()) {
      case 'mp4':
        return VideoFormat.MP4;
      case 'mov':
        return VideoFormat.MOV;
      case 'avi':
        return VideoFormat.AVI;
      case 'mkv':
        return VideoFormat.MKV;
      default:
        return VideoFormat.MP4;
    }
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
    return `media3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.eventListeners.clear();
    this.activeSessions.clear();
  }
}