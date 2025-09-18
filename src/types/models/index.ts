/**
 * Video quality levels supported by the converter
 */
export enum VideoQuality {
  LOW = '360p',
  SD = '480p', 
  HD = '720p',
  FULL_HD = '1080p',
  UHD_4K = '2160p',
}

/**
 * Supported output formats for conversion
 */
export enum OutputFormat {
  MP4 = 'MP4',
  MOV = 'MOV',
  AVI = 'AVI',
  MKV = 'MKV',
}

/**
 * Conversion priority levels
 */
export type ConversionPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Video metadata extracted from file analysis
 */
export interface VideoMetadata {
  /** Video duration in milliseconds */
  duration: number;
  /** Video width in pixels */
  width: number;
  /** Video height in pixels */
  height: number;
  /** Frame rate (fps) */
  frameRate: number;
  /** Video bitrate in bits per second */
  bitrate: number;
  /** Video codec (e.g., 'h264', 'h265', 'vp9') */
  codec: string;
  /** Audio codec (optional) */
  audioCodec?: string;
  /** Audio bitrate in bits per second (optional) */
  audioBitrate?: number;
  /** Audio sample rate in Hz (optional) */
  audioSampleRate?: number;
  /** Number of audio channels (optional) */
  audioChannels?: number;
}

/**
 * Video file representation with metadata
 */
export interface VideoFile {
  /** Unique identifier for the video file */
  id: string;
  /** Original filename */
  name: string;
  /** Absolute file path on device */
  path: string;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g., 'video/mp4') */
  mimeType: string;
  /** File creation timestamp */
  createdAt: Date;
  /** Extracted video metadata */
  metadata: VideoMetadata;
}

/**
 * Video file validation result
 */
export interface VideoValidationResult {
  /** Whether the video file is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
}

/**
 * Crop parameters for video trimming
 */
export interface CropParams {
  /** X coordinate for crop start */
  x: number;
  /** Y coordinate for crop start */
  y: number;
  /** Width of the cropped area */
  width: number;
  /** Height of the cropped area */
  height: number;
}

/**
 * Conversion options for customizing output
 */
export interface ConversionOptions {
  /** Whether to preserve original audio */
  preserveAudio?: boolean;
  /** Custom bitrate in bits per second */
  customBitrate?: number;
  /** Custom frame rate */
  customFrameRate?: number;
  /** Start time for trimming in milliseconds */
  startTime?: number;
  /** End time for trimming in milliseconds */
  endTime?: number;
  /** Crop parameters */
  cropParams?: CropParams;
}

/**
 * Quality preset configuration
 */
export interface ConversionQualityPreset {
  /** Target video quality */
  quality: VideoQuality;
  /** Target bitrate in bits per second */
  targetBitrate: number;
  /** Target frame rate */
  targetFrameRate: number;
  /** Maximum dimensions */
  maxDimensions: {
    width: number;
    height: number;
  };
  /** Audio settings */
  audioSettings: {
    codec: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}

/**
 * Conversion request containing input, output, and options
 */
export interface ConversionRequest {
  /** Unique identifier for the conversion request */
  id: string;
  /** Input video file */
  inputFile: VideoFile;
  /** Output file path */
  outputPath: string;
  /** Target video quality */
  targetQuality: VideoQuality;
  /** Output format */
  outputFormat: OutputFormat;
  /** Conversion options (optional) */
  options?: ConversionOptions;
  /** Request creation timestamp */
  createdAt: Date;
  /** Processing priority (optional) */
  priority?: ConversionPriority;
}

/**
 * Conversion request validation result
 */
export interface ConversionValidationResult {
  /** Whether the conversion request is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
}

/**
 * Conversion status enumeration
 */
export enum ConversionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'info' | 'warning' | 'critical';

/**
 * Conversion progress tracking
 */
export interface ConversionProgress {
  /** Completion percentage (0-100) */
  percentage: number;
  /** Current frame being processed */
  currentFrame: number;
  /** Total frames to process */
  totalFrames: number;
  /** Duration processed in milliseconds */
  processedDuration: number;
  /** Total duration to process in milliseconds */
  totalDuration: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number;
  /** Current encoding bitrate */
  currentBitrate: number;
  /** Average frames per second being processed */
  averageFps: number;
}

/**
 * Conversion error information
 */
export interface ConversionError {
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Additional error details (optional) */
  details?: Record<string, any>;
}

/**
 * Conversion statistics
 */
export interface ConversionStats {
  /** Input file size in bytes */
  inputSize: number;
  /** Output file size in bytes */
  outputSize: number;
  /** Compression ratio (output/input) */
  compressionRatio: number;
  /** Total processing duration in milliseconds */
  processingDuration: number;
  /** Average processing speed (real-time ratio) */
  averageSpeed: number;
}

/**
 * Output file metadata
 */
export interface OutputFile {
  /** Output file path */
  path: string;
  /** Output file size in bytes */
  size: number;
  /** Output video metadata */
  metadata: VideoMetadata;
}

/**
 * Conversion result containing status, progress, and output
 */
export interface ConversionResult {
  /** Unique identifier for the conversion result */
  id: string;
  /** Original conversion request */
  request: ConversionRequest;
  /** Current conversion status */
  status: ConversionStatus;
  /** Current conversion progress */
  progress: ConversionProgress;
  /** Conversion start timestamp */
  startTime: Date;
  /** Conversion end timestamp (optional) */
  endTime?: Date;
  /** Output file information (for successful conversions) */
  outputFile?: OutputFile;
  /** Error information (for failed conversions) */
  error?: ConversionError;
  /** Conversion statistics (for completed conversions) */
  stats?: ConversionStats;
}

/**
 * Conversion result validation result
 */
export interface ConversionResultValidationResult {
  /** Whether the conversion result is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
}

// Re-export from individual modules
export * from './VideoFile';
export * from './ConversionRequest';
export * from './ConversionResult';
export * from './DeviceCapabilities';