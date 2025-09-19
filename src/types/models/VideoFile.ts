import { VideoFile, VideoMetadata, VideoQuality } from './index';

// Type definitions for this module
export interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
}

// Constants for validation
const MIN_FILE_SIZE = 1024; // 1KB
const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB
const MAX_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const MIN_DIMENSIONS = 1;
const MIN_FRAME_RATE = 1;
const MIN_BITRATE = 1;

// Supported video MIME types
const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
];

/**
 * Validates a VideoFile object for correctness and compliance
 * @param videoFile - The video file to validate
 * @returns Validation result with errors if any
 */
export function validateVideoFile(videoFile: VideoFile): VideoValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!videoFile.id || videoFile.id.trim() === '') {
    errors.push('ID is required');
  }

  if (!videoFile.name || videoFile.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!videoFile.path || videoFile.path.trim() === '') {
    errors.push('Valid file path is required');
  }

  // Validate file size
  if (videoFile.size < MIN_FILE_SIZE) {
    errors.push('File size too small (minimum 1KB)');
  }

  if (videoFile.size > MAX_FILE_SIZE) {
    errors.push('File size exceeds maximum limit (4GB)');
  }

  // Validate MIME type
  if (!isVideoSupported(videoFile.mimeType)) {
    errors.push('Unsupported video format');
  }

  // Validate creation date
  const now = new Date();
  if (videoFile.createdAt > now) {
    errors.push('Creation date cannot be in the future');
  }

  // Validate metadata
  if (videoFile.metadata) {
    const metadata = videoFile.metadata;

    // Validate dimensions
    if (metadata.width < MIN_DIMENSIONS || metadata.height < MIN_DIMENSIONS) {
      errors.push('Invalid video dimensions');
    }

    // Validate duration
    if (metadata.duration < 0) {
      errors.push('Invalid video duration');
    }

    if (metadata.duration > MAX_DURATION) {
      errors.push('Video duration exceeds maximum limit (1 hour)');
    }

    // Validate frame rate
    if (metadata.frameRate < MIN_FRAME_RATE) {
      errors.push('Invalid frame rate');
    }

    // Validate bitrate
    if (metadata.bitrate < MIN_BITRATE) {
      errors.push('Invalid bitrate');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determines video quality based on resolution
 * @param metadata - Video metadata containing dimensions
 * @returns VideoQuality enum value
 */
export function getVideoQuality(metadata: VideoMetadata): VideoQuality {
  const { width, height } = metadata;
  
  // Use the larger dimension to handle both landscape and portrait
  const maxDimension = Math.max(width, height);
  const minDimension = Math.min(width, height);

  // 4K/UHD: 3840x2160 or 2160x3840
  if (maxDimension >= 2160) {
    return VideoQuality.UHD_4K;
  }

  // 1080p/Full HD: 1920x1080 or 1080x1920
  if (maxDimension >= 1920 || minDimension >= 1080) {
    return VideoQuality.FULL_HD;
  }

  // 720p/HD: 1280x720 or 720x1280
  if (maxDimension >= 1280 || minDimension >= 720) {
    return VideoQuality.HD;
  }

  // 480p/SD: 854x480 or 480x854
  if (maxDimension >= 854 || minDimension >= 480) {
    return VideoQuality.SD;
  }

  // Everything else is considered low quality
  return VideoQuality.LOW;
}

/**
 * Checks if a video MIME type is supported for conversion
 * @param mimeType - The MIME type to check
 * @returns True if supported, false otherwise
 */
export function isVideoSupported(mimeType: string): boolean {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }

  return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Estimates the compression ratio for a video quality conversion
 * @param fromQuality - Original video quality
 * @param toQuality - Target video quality
 * @returns Estimated compression ratio (0-1, where 1 is no compression)
 */
export function estimateCompressionRatio(
  fromQuality: VideoQuality,
  toQuality: VideoQuality
): number {
  const qualityOrder = [
    VideoQuality.LOW,
    VideoQuality.SD,
    VideoQuality.HD,
    VideoQuality.FULL_HD,
    VideoQuality.UHD_4K,
  ];

  const fromIndex = qualityOrder.indexOf(fromQuality);
  const toIndex = qualityOrder.indexOf(toQuality);

  if (fromIndex === -1 || toIndex === -1) {
    return 1; // No compression if invalid quality
  }

  if (toIndex >= fromIndex) {
    return 1; // No compression needed if target is same or higher quality
  }

  // Rough compression ratios based on quality differences
  const compressionFactors = [0.2, 0.35, 0.5, 0.7, 1.0];
  return compressionFactors[toIndex] ?? 1.0;
}

/**
 * Calculates estimated output file size after conversion
 * @param originalSize - Original file size in bytes
 * @param fromQuality - Original video quality
 * @param toQuality - Target video quality
 * @returns Estimated output size in bytes
 */
export function estimateOutputSize(
  originalSize: number,
  fromQuality: VideoQuality,
  toQuality: VideoQuality
): number {
  const compressionRatio = estimateCompressionRatio(fromQuality, toQuality);
  return Math.round(originalSize * compressionRatio);
}