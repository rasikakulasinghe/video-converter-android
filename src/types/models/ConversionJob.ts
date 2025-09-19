/**
 * @fileoverview ConversionJob model with comprehensive conversion tracking
 * Handles video conversion job management, progress tracking, and result handling.
 */

import { VideoFile, VideoFormat, VideoQuality } from './index';

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
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
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
  /** Current progress percentage (0.0 to 100.0) */
  percentage: number;
  /** Processed frames */
  processedFrames: number;
  /** Total frames to process */
  totalFrames: number;
  /** Current processing step */
  currentStep: string;
  /** Elapsed time in seconds */
  timeElapsed: number;
  /** Estimated time remaining in seconds */
  timeRemaining: number;
  /** Current processing speed (fps) */
  currentFps: number;
  /** Average processing speed (fps) */
  averageFps: number;
  /** Bytes processed so far (optional) */
  bytesProcessed?: number;
  /** Total bytes to process (optional) */
  totalBytes?: number;
  /** CPU usage percentage (optional) */
  cpuUsage?: number;
  /** Memory usage in MB (optional) */
  memoryUsage?: number;
}

/**
 * Conversion settings configuration
 */
export interface ConversionSettings {
  /** Target output format */
  outputFormat: VideoFormat;
  /** Video quality level */
  quality: OutputQuality;
  /** Compression level */
  compression: CompressionLevel;
  /** Target bitrate in bps */
  targetBitrate: number;
  /** Maximum width */
  maxWidth: number;
  /** Maximum height */
  maxHeight: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio: boolean;
  /** Frame rate (optional advanced setting) */
  frameRate?: number;
  /** Audio codec (optional advanced setting) */
  audioCodec?: 'aac' | 'mp3' | 'opus';
  /** Video CRF (optional advanced setting) */
  videoCrf?: number;
  /** Encoding preset (optional advanced setting) */
  preset?: string;
}

/**
 * Conversion request information
 */
export interface ConversionRequest {
  /** Unique request identifier */
  id: string;
  /** Source video file */
  inputFile: VideoFile;
  /** Output file path */
  outputPath: string;
  /** Conversion settings */
  settings: ConversionSettings;
  /** Request timestamp */
  createdAt: Date;
  /** Optional user notes */
  userNotes?: string;
  /** Request priority */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Conversion result information
 */
export interface ConversionResult {
  /** Whether conversion was successful */
  success: boolean;
  /** Output file information */
  outputFile?: VideoFile;
  /** Processing time in seconds */
  processingTime: number;
  /** Final progress information */
  finalProgress: ConversionProgress;
  /** Completion timestamp */
  completedAt: Date;
  /** Compression ratio achieved */
  compressionRatio?: number;
  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    details?: string;
  };
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
  /** Estimated completion time */
  estimatedCompletionAt?: Date;
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