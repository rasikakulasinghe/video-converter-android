import { ConversionStatus, VideoFile } from './index';
import type { ConversionRequest } from './ConversionRequest';

// Type definitions for this module
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ConversionError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  stack?: string;
}

export interface ConversionProgress {
  percentage: number;
  currentFrame: number;
  totalFrames: number;
  processedDuration: number;
  totalDuration: number;
  estimatedTimeRemaining: number;
  currentBitrate: number;
  averageFps: number;
}

export interface ConversionResultValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConversionResult {
  id: string;
  request: ConversionRequest;
  status: ConversionStatus;
  progress: ConversionProgress;
  startTime: Date;
  endTime?: Date;
  outputFile?: VideoFile;
  error?: ConversionError;
  stats?: {
    compressionRatio: number;
    processingDuration: number;
    averageSpeed: number;
  };
}

/**
 * Validates a ConversionResult for correctness and compliance
 * @param result - The conversion result to validate
 * @returns Validation result with errors if any
 */
export function validateConversionResult(result: ConversionResult): ConversionResultValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!result.id || result.id.trim() === '') {
    errors.push('Result ID is required');
  }

  if (!result.request) {
    errors.push('Conversion request is required');
  }

  // Validate progress
  if (result.progress) {
    const progressErrors = validateProgress(result.progress);
    errors.push(...progressErrors);
  }

  // Validate timestamps
  if (result.startTime > new Date()) {
    errors.push('Start time cannot be in the future');
  }

  if (result.endTime && result.startTime && result.endTime <= result.startTime) {
    errors.push('End time must be after start time');
  }

  // Validate status-specific requirements
  if (result.status === ConversionStatus.COMPLETED) {
    if (!result.endTime) {
      errors.push('End time is required for completed conversions');
    }
    if (!result.outputFile) {
      errors.push('Output file is required for completed conversions');
    }
  }

  if (result.status === ConversionStatus.FAILED) {
    if (!result.error) {
      errors.push('Error information is required for failed conversions');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates conversion progress data
 * @param progress - Progress data to validate
 * @returns Array of validation errors
 */
function validateProgress(progress: ConversionProgress): string[] {
  const errors: string[] = [];

  // Validate percentage
  if (progress.percentage < 0 || progress.percentage > 100) {
    errors.push('Progress percentage must be between 0 and 100');
  }

  // Validate frame counts
  if (progress.currentFrame > progress.totalFrames) {
    errors.push('Current frame cannot exceed total frames');
  }

  if (progress.currentFrame < 0) {
    errors.push('Current frame cannot be negative');
  }

  if (progress.totalFrames < 0) {
    errors.push('Total frames cannot be negative');
  }

  // Validate durations
  if (progress.processedDuration < 0) {
    errors.push('Processed duration cannot be negative');
  }

  if (progress.totalDuration < 0) {
    errors.push('Total duration cannot be negative');
  }

  if (progress.estimatedTimeRemaining < 0) {
    errors.push('Estimated time remaining cannot be negative');
  }

  // Validate rates
  if (progress.currentBitrate < 0) {
    errors.push('Current bitrate cannot be negative');
  }

  if (progress.averageFps < 0) {
    errors.push('Average FPS cannot be negative');
  }

  return errors;
}

/**
 * Creates a progress update with calculated values
 * @param params - Progress parameters
 * @returns Complete progress object with calculations
 */
export function createProgressUpdate(params: {
  currentFrame: number;
  totalFrames: number;
  processedDuration: number;
  totalDuration: number;
  currentBitrate: number;
  averageFps: number;
}): ConversionProgress {
  const { 
    currentFrame, 
    totalFrames, 
    processedDuration, 
    totalDuration, 
    currentBitrate, 
    averageFps 
  } = params;

  // Calculate percentage based on processed duration
  let percentage = 0;
  if (totalDuration > 0) {
    percentage = Math.min(100, Math.max(0, (processedDuration / totalDuration) * 100));
  }

  // Calculate estimated time remaining
  let estimatedTimeRemaining = 0;
  if (percentage > 0 && percentage < 100) {
    const remainingDuration = totalDuration - processedDuration;
    estimatedTimeRemaining = Math.max(0, remainingDuration);
  } else if (percentage === 0 && totalDuration > 0) {
    // If no progress yet, estimate full duration
    estimatedTimeRemaining = totalDuration;
  }

  return {
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    currentFrame,
    totalFrames,
    processedDuration,
    totalDuration,
    estimatedTimeRemaining,
    currentBitrate,
    averageFps,
  };
}

/**
 * Calculates compression ratio between input and output file sizes
 * @param inputSize - Input file size in bytes
 * @param outputSize - Output file size in bytes
 * @returns Compression ratio (output/input)
 */
export function calculateCompressionRatio(inputSize: number, outputSize: number): number {
  if (inputSize <= 0) {
    return 0;
  }
  
  return Math.round((outputSize / inputSize) * 100) / 100; // Round to 2 decimal places
}

/**
 * Formats conversion duration into human-readable string
 * @param duration - Duration in milliseconds
 * @returns Formatted duration string (e.g., "1h 2m 3s")
 */
export function formatConversionDuration(duration: number): string {
  if (duration < 1000) {
    return '0s';
  }

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Checks if a conversion is complete
 * @param result - Conversion result to check
 * @returns True if conversion is completed successfully
 */
export function isConversionComplete(result: ConversionResult): boolean {
  return result.status === ConversionStatus.COMPLETED;
}

/**
 * Checks if a conversion has failed
 * @param result - Conversion result to check
 * @returns True if conversion has failed or been cancelled
 */
export function isConversionFailed(result: ConversionResult): boolean {
  return result.status === ConversionStatus.FAILED || result.status === ConversionStatus.CANCELLED;
}

/**
 * Gets the severity level of a conversion error
 * @param error - Conversion error
 * @returns Error severity level
 */
export function getErrorSeverity(error: ConversionError): ErrorSeverity {
  return error.severity;
}

/**
 * Estimates the processing speed based on conversion result
 * @param result - Conversion result
 * @returns Processing speed as real-time ratio (1.0 = real-time)
 */
export function calculateProcessingSpeed(result: ConversionResult): number {
  if (!result.endTime || !result.request.inputFile.metadata.duration) {
    return 0;
  }

  const processingDuration = result.endTime.getTime() - result.startTime.getTime();
  const videoDuration = result.request.inputFile.metadata.duration;

  if (processingDuration <= 0) {
    return 0;
  }

  return Math.round((videoDuration / processingDuration) * 100) / 100;
}

/**
 * Creates a summary of conversion statistics
 * @param result - Completed conversion result
 * @returns Conversion statistics summary
 */
export function createConversionSummary(result: ConversionResult): string {
  if (!isConversionComplete(result) || !result.outputFile || !result.stats) {
    return 'Conversion not completed';
  }

  const compressionPercentage = Math.round((1 - result.stats.compressionRatio) * 100);
  const duration = formatConversionDuration(result.stats.processingDuration);
  const speed = result.stats.averageSpeed;

  return `Conversion completed in ${duration}. Size reduced by ${compressionPercentage}% (${speed.toFixed(1)}x speed).`;
}

/**
 * Determines if a conversion can be resumed
 * @param result - Conversion result to check
 * @returns True if conversion can be resumed
 */
export function canResumeConversion(result: ConversionResult): boolean {
  return result.status === ConversionStatus.PAUSED && result.progress.percentage < 100;
}

/**
 * Determines if a conversion can be cancelled
 * @param result - Conversion result to check
 * @returns True if conversion can be cancelled
 */
export function canCancelConversion(result: ConversionResult): boolean {
  return result.status === ConversionStatus.PROCESSING || result.status === ConversionStatus.PAUSED;
}