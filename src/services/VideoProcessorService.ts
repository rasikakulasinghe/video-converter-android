/**
 * @fileoverview VideoProcessorService interface and related types
 * Defines the contract for video processing operations using FFmpeg
 */

import { ConversionRequest, ConversionResult, VideoFile, VideoQuality, OutputFormat } from '../types/models';
import type { DeviceCapabilities } from '../types/models/DeviceCapabilities';

/**
 * Session states for tracking conversion progress
 */
export enum SessionState {
  CREATED = 'CREATED',
  VALIDATED = 'VALIDATED',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Processing error types for categorizing failures
 */
export enum ProcessingErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  DEVICE_OVERHEATING = 'DEVICE_OVERHEATING',
  LOW_BATTERY = 'LOW_BATTERY',
  ENCODING_ERROR = 'ENCODING_ERROR',
  DECODING_ERROR = 'DECODING_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Conversion event types for progress tracking
 */
export enum ConversionEventType {
  SESSION_CREATED = 'session_created',
  CONVERSION_STARTED = 'conversion_started',
  PROGRESS_UPDATE = 'progress_update',
  PHASE_CHANGED = 'phase_changed',
  CONVERSION_PAUSED = 'conversion_paused',
  CONVERSION_RESUMED = 'conversion_resumed',
  CONVERSION_COMPLETED = 'conversion_completed',
  CONVERSION_FAILED = 'conversion_failed',
  CONVERSION_CANCELLED = 'conversion_cancelled',
  DEVICE_WARNING = 'device_warning',
}

/**
 * Custom processing error class
 */
export class ProcessingError extends Error {
  constructor(
    public readonly type: ProcessingErrorType,
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

/**
 * Conversion progress information
 */
export interface ConversionProgress {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Processed duration in milliseconds */
  processedDuration: number;
  /** Total duration in milliseconds */
  totalDuration: number;
  /** Current processing phase */
  currentPhase: string;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number;
  /** Processing speed (real-time ratio) */
  processingSpeed: number;
}

/**
 * Conversion statistics and performance metrics
 */
export interface ConversionStatistics {
  /** Processing start time */
  startTime: Date;
  /** Processing end time (if completed) */
  endTime?: Date;
  /** Total bytes processed */
  bytesProcessed: number;
  /** Total frames processed */
  framesProcessed: number;
  /** Average processing speed */
  averageSpeed: number;
  /** Peak memory usage in bytes */
  peakMemoryUsage: number;
  /** Current CPU usage percentage */
  cpuUsage: number;
}

/**
 * Conversion session representing an active or completed conversion
 */
export interface ConversionSession {
  /** Unique session identifier */
  id: string;
  /** Original conversion request */
  request: ConversionRequest;
  /** Current session state */
  state: SessionState;
  /** Session creation timestamp */
  createdAt: Date;
  /** Processing start timestamp */
  startedAt?: Date;
  /** Processing completion timestamp */
  completedAt?: Date;
  /** Current conversion progress */
  progress: ConversionProgress;
  /** Processing statistics */
  statistics: ConversionStatistics;
  /** Error information (if failed) */
  error?: ProcessingError;
  /** Output file information (if completed) */
  result?: ConversionResult;
}

/**
 * Processing options and configuration
 */
export interface ProcessingOptions {
  /** Device capabilities for optimization */
  deviceCapabilities: DeviceCapabilities;
  /** Maximum concurrent conversion sessions */
  maxConcurrentSessions: number;
  /** Enable hardware acceleration if available */
  enableHardwareAcceleration: boolean;
  /** Use GPU acceleration if supported */
  useGpuAcceleration: boolean;
  /** Quality preference: 'speed', 'balanced', 'quality' */
  qualityPreference: 'speed' | 'balanced' | 'quality';
  /** Enable power saving mode */
  powerSavingMode: boolean;
  /** Enable thermal monitoring and throttling */
  thermalMonitoring: boolean;
  /** Progress update interval in milliseconds */
  progressUpdateInterval: number;
  /** Temporary directory for processing files */
  tempDirectory: string;
  /** Progress event callback */
  onProgress?: (event: ConversionEvent) => void;
  /** Error event callback */
  onError?: (error: ProcessingError) => void;
  /** Completion event callback */
  onComplete?: (result: ConversionResult) => void;
}

/**
 * Conversion event with data payload
 */
export interface ConversionEvent {
  /** Event type */
  type: ConversionEventType;
  /** Session ID that triggered the event */
  sessionId: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event data payload */
  data?: any;
}

/**
 * FFmpeg command configuration
 */
export interface FFmpegCommand {
  /** Input file path */
  inputPath: string;
  /** Output file path */
  outputPath: string;
  /** FFmpeg command arguments */
  arguments: string[];
  /** Expected processing time in milliseconds */
  estimatedDuration: number;
}

/**
 * Video analysis result from file inspection
 */
export interface VideoAnalysisResult {
  /** Whether the video file is valid and processable */
  isValid: boolean;
  /** Video metadata (if valid) */
  metadata: any;
  /** Supported output formats for this video */
  supportedFormats: OutputFormat[];
  /** Recommended quality setting */
  recommendedQuality: VideoQuality;
  /** Estimated processing time in milliseconds */
  estimatedProcessingTime: number;
  /** Processing complexity: 'simple', 'medium', 'complex', 'unknown' */
  complexity: 'simple' | 'medium' | 'complex' | 'unknown';
  /** Issues or warnings found during analysis */
  issues: string[];
}

/**
 * Quality profile definition
 */
export interface QualityProfile {
  /** Quality level */
  quality: VideoQuality;
  /** Output width in pixels */
  width: number;
  /** Output height in pixels */
  height: number;
  /** Target bitrate in bits per second */
  bitrate: number;
  /** Target frame rate */
  frameRate: number;
  /** Codec profile (baseline, main, high) */
  codecProfile: string;
  /** Human-readable description */
  description: string;
}

/**
 * Conversion preset with predefined settings
 */
export interface ConversionPreset {
  /** Preset identifier */
  id: string;
  /** Preset name */
  name: string;
  /** Preset description */
  description: string;
  /** Target quality */
  quality: VideoQuality;
  /** Target format */
  format: OutputFormat;
  /** FFmpeg arguments */
  ffmpegArgs: string[];
  /** Estimated speed multiplier */
  speedMultiplier: number;
  /** Required device capability score */
  minCapabilityScore: number;
}

/**
 * Request validation result
 */
export interface ValidationResult {
  /** Whether the request is valid */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Warning messages */
  warnings: string[];
}

/**
 * Video processor service interface for handling video conversions
 */
export interface VideoProcessorService {
  /**
   * Analyzes a video file and returns metadata and recommendations
   */
  analyzeVideo(filePath: string): Promise<VideoAnalysisResult>;

  /**
   * Creates a new conversion session from a request
   */
  createSession(request: ConversionRequest): Promise<ConversionSession>;

  /**
   * Starts processing for the specified session
   */
  startConversion(sessionId: string, options: ProcessingOptions): Promise<void>;

  /**
   * Pauses an active conversion session
   */
  pauseConversion(sessionId: string): Promise<void>;

  /**
   * Resumes a paused conversion session
   */
  resumeConversion(sessionId: string): Promise<void>;

  /**
   * Cancels a conversion session and cleans up resources
   */
  cancelConversion(sessionId: string): Promise<void>;

  /**
   * Gets current status and progress for a session
   */
  getSessionStatus(sessionId: string): Promise<ConversionSession>;

  /**
   * Gets list of supported output formats
   */
  getSupportedFormats(deviceCapabilities?: DeviceCapabilities): Promise<OutputFormat[]>;

  /**
   * Gets available quality profiles
   */
  getQualityProfiles(): Promise<QualityProfile[]>;

  /**
   * Gets available conversion presets
   */
  getConversionPresets(): Promise<ConversionPreset[]>;

  /**
   * Validates a conversion request
   */
  validateRequest(request: ConversionRequest): Promise<ValidationResult>;

  /**
   * Estimates processing time for a conversion request
   */
  estimateProcessingTime(
    request: ConversionRequest,
    deviceCapabilities: DeviceCapabilities
  ): Promise<number>;

  /**
   * Estimates output file size for a conversion request
   */
  estimateOutputSize(request: ConversionRequest): Promise<number>;

  /**
   * Cleans up temporary files and resources
   */
  cleanup(sessionId?: string): Promise<void>;
}