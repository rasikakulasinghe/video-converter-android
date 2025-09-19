/**
 * @fileoverview ConversionJob model with comprehensive conversion tracking
 * Handles video conversion job management, progress tracking, and result handling.
 */

import { VideoFile, VideoFormat, VideoQuality, OutputFormat } from './index';

/**
 * Conversion status enumeration
 */
export enum ConversionStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

/**
 * Compression level enumeration
 */
export enum CompressionLevel {
  FAST = 'fast',
  BALANCED = 'balanced',
  QUALITY = 'quality',
  MAXIMUM = 'maximum',
}

/**
 * Output quality enumeration
 */
export enum OutputQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

/**
 * Conversion progress information
 */
export interface ConversionProgress {
  /** Current progress percentage (0.0 to 1.0) */
  percentage: number;
  /** Processed frames */
  processedFrames: number;
  /** Total frames to process */
  totalFrames: number;
  /** Current processing speed (fps) */
  currentFps: number;
  /** Average processing speed (fps) */
  averageFps: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining: number;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Currently processing stage */
  currentStage: string;
  /** Output file size so far in bytes */
  outputSize: number;
  /** Memory usage during conversion in bytes */
  memoryUsage: number;
  /** CPU usage percentage (0.0 to 1.0) */
  cpuUsage: number;
  /** Timestamp of last update */
  lastUpdate: Date;
}

/**
 * Conversion settings configuration
 */
export interface ConversionSettings {
  /** Target output format */
  outputFormat: OutputFormat;
  /** Video quality level */
  quality: OutputQuality;
  /** Compression level */
  compression: CompressionLevel;
  /** Target bitrate in bps */
  targetBitrate?: number;
  /** Target frame rate */
  targetFrameRate?: number;
  /** Target resolution */
  targetResolution?: {
    width: number;
    height: number;
  };
  /** Audio codec */
  audioCodec: 'aac' | 'mp3' | 'opus';
  /** Audio bitrate in bps */
  audioBitrate?: number;
  /** Whether to preserve metadata */
  preserveMetadata: boolean;
  /** Whether to use hardware acceleration */
  useHardwareAcceleration: boolean;
  /** Additional FFmpeg options */
  customOptions?: string[];
}

/**
 * Conversion request information
 */
export interface ConversionRequest {
  /** Unique request identifier */
  id: string;
  /** Source video file */
  sourceFile: VideoFile;
  /** Desired output filename */
  outputFileName: string;
  /** Output directory path */
  outputPath: string;
  /** Conversion settings */
  settings: ConversionSettings;
  /** Request priority */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Whether to overwrite existing files */
  overwriteExisting: boolean;
  /** Request timestamp */
  requestedAt: Date;
  /** User identifier */
  userId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Conversion result information
 */
export interface ConversionResult {
  /** Whether conversion was successful */
  success: boolean;
  /** Output file information */
  outputFile?: VideoFile;
  /** Final file size in bytes */
  outputSize?: number;
  /** Total processing time in seconds */
  totalTime: number;
  /** Average processing speed (fps) */
  averageSpeed: number;
  /** Compression ratio achieved */
  compressionRatio?: number;
  /** Quality metrics */
  qualityMetrics?: {
    psnr?: number;
    ssim?: number;
    vmaf?: number;
  };
  /** Error information if failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  /** Warnings encountered */
  warnings: string[];
  /** FFmpeg command used */
  ffmpegCommand?: string;
  /** FFmpeg logs */
  logs?: string[];
  /** Completion timestamp */
  completedAt: Date;
}

/**
 * Complete conversion job information
 */
export interface ConversionJob {
  /** Unique job identifier */
  id: string;
  /** Conversion request */
  request: ConversionRequest;
  /** Current job status */
  status: ConversionStatus;
  /** Current progress information */
  progress: ConversionProgress;
  /** Conversion result (when completed) */
  result?: ConversionResult;
  /** Job creation timestamp */
  createdAt: Date;
  /** Job start timestamp */
  startedAt?: Date;
  /** Job completion timestamp */
  completedAt?: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Number of retry attempts */
  retryCount: number;
  /** Maximum allowed retries */
  maxRetries: number;
  /** Job cancellation reason */
  cancellationReason?: string;
  /** Whether job can be retried */
  canRetry: boolean;
  /** Device resources snapshot at job start */
  deviceSnapshot?: any;
  /** Job priority */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Estimated completion time */
  estimatedCompletion?: Date;
}

/**
 * Job queue information
 */
export interface ConversionQueue {
  /** Queue identifier */
  id: string;
  /** Jobs in queue */
  jobs: ConversionJob[];
  /** Currently processing job */
  currentJob?: ConversionJob;
  /** Queue status */
  status: 'idle' | 'processing' | 'paused' | 'error';
  /** Maximum concurrent jobs */
  maxConcurrentJobs: number;
  /** Currently active jobs */
  activeJobs: number;
  /** Queue statistics */
  statistics: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    averageProcessingTime: number;
  };
}

/**
 * Batch conversion configuration
 */
export interface BatchConversionConfig {
  /** Batch identifier */
  id: string;
  /** List of conversion requests */
  requests: ConversionRequest[];
  /** Common settings for all jobs */
  commonSettings?: Partial<ConversionSettings>;
  /** Batch processing strategy */
  strategy: 'sequential' | 'parallel' | 'adaptive';
  /** Maximum concurrent jobs for batch */
  maxConcurrentJobs?: number;
  /** Whether to stop on first error */
  stopOnError: boolean;
  /** Batch completion callback */
  onComplete?: (results: ConversionResult[]) => void;
  /** Progress callback */
  onProgress?: (progress: number) => void;
}