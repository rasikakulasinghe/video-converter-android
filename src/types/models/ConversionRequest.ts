import { VideoQuality, OutputFormat, VideoFile } from './index';

// Type definitions for this module
export interface ConversionValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConversionOptions {
  preserveAudio?: boolean;
  startTime?: number;
  endTime?: number;
  customBitrate?: number;
  customFrameRate?: number;
  cropParams?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ConversionQualityPreset {
  quality: VideoQuality;
  targetBitrate: number;
  targetFrameRate: number;
  maxDimensions: { width: number; height: number };
  audioSettings: {
    codec: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}

export interface ConversionRequest {
  id: string;
  inputFile: VideoFile;
  outputPath: string;
  outputFormat: OutputFormat;
  targetQuality: VideoQuality;
  options?: ConversionOptions;
  createdAt: Date;
}

// Constants for validation
const MIN_BITRATE = 64000; // 64 kbps minimum
const MAX_BITRATE = 50000000; // 50 Mbps maximum
const MIN_FRAME_RATE = 1;
const MAX_FRAME_RATE = 120;

// Quality preset configurations
const QUALITY_PRESETS: Record<VideoQuality, Omit<ConversionQualityPreset, 'quality'>> = {
  [VideoQuality.LOW]: {
    targetBitrate: 500000, // 500 kbps
    targetFrameRate: 24,
    maxDimensions: { width: 640, height: 360 },
    audioSettings: { codec: 'aac', bitrate: 64000, sampleRate: 22050, channels: 1 },
  },
  [VideoQuality.SD]: {
    targetBitrate: 1000000, // 1 Mbps
    targetFrameRate: 25,
    maxDimensions: { width: 854, height: 480 },
    audioSettings: { codec: 'aac', bitrate: 96000, sampleRate: 44100, channels: 2 },
  },
  [VideoQuality.HD]: {
    targetBitrate: 2500000, // 2.5 Mbps
    targetFrameRate: 30,
    maxDimensions: { width: 1280, height: 720 },
    audioSettings: { codec: 'aac', bitrate: 128000, sampleRate: 44100, channels: 2 },
  },
  [VideoQuality.FULL_HD]: {
    targetBitrate: 5000000, // 5 Mbps
    targetFrameRate: 30,
    maxDimensions: { width: 1920, height: 1080 },
    audioSettings: { codec: 'aac', bitrate: 128000, sampleRate: 44100, channels: 2 },
  },
  [VideoQuality.UHD_4K]: {
    targetBitrate: 20000000, // 20 Mbps
    targetFrameRate: 30,
    maxDimensions: { width: 3840, height: 2160 },
    audioSettings: { codec: 'aac', bitrate: 256000, sampleRate: 48000, channels: 2 },
  },
};

// Format to extension mapping
const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  [OutputFormat.MP4]: '.mp4',
  [OutputFormat.MOV]: '.mov',
  [OutputFormat.AVI]: '.avi',
  [OutputFormat.MKV]: '.mkv',
};

/**
 * Validates a ConversionRequest for correctness and compliance
 * @param request - The conversion request to validate
 * @returns Validation result with errors if any
 */
export function validateConversionRequest(request: ConversionRequest): ConversionValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!request.id || request.id.trim() === '') {
    errors.push('Request ID is required');
  }

  if (!request.outputPath || request.outputPath.trim() === '') {
    errors.push('Output path is required');
  }

  // Validate output path format
  if (request.outputPath && !validateOutputPath(request.outputPath)) {
    errors.push('Output path must have a valid file extension');
  }

  // Validate output format matches file extension
  if (request.outputPath && request.outputFormat) {
    const expectedExtension = FORMAT_EXTENSIONS[request.outputFormat];
    if (!request.outputPath.toLowerCase().endsWith(expectedExtension)) {
      errors.push('Output format does not match file extension');
    }
  }

  // Validate creation date
  const now = new Date();
  if (request.createdAt > now) {
    errors.push('Creation date cannot be in the future');
  }

  // Validate options if provided
  if (request.options) {
    const optionErrors = validateConversionOptions(request.options, request.inputFile);
    errors.push(...optionErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates conversion options
 * @param options - Conversion options to validate
 * @param inputFile - Input video file for context
 * @returns Array of validation errors
 */
function validateConversionOptions(options: ConversionOptions, inputFile: any): string[] {
  const errors: string[] = [];

  // Validate custom bitrate
  if (options.customBitrate !== undefined) {
    if (options.customBitrate <= 0) {
      errors.push('Custom bitrate must be positive');
    } else if (options.customBitrate < MIN_BITRATE || options.customBitrate > MAX_BITRATE) {
      errors.push(`Custom bitrate must be between ${MIN_BITRATE} and ${MAX_BITRATE} bps`);
    }
  }

  // Validate custom frame rate
  if (options.customFrameRate !== undefined) {
    if (options.customFrameRate < MIN_FRAME_RATE || options.customFrameRate > MAX_FRAME_RATE) {
      errors.push(`Custom frame rate must be between ${MIN_FRAME_RATE} and ${MAX_FRAME_RATE} fps`);
    }
  }

  // Validate time range
  if (options.startTime !== undefined && options.endTime !== undefined) {
    if (options.startTime >= options.endTime) {
      errors.push('End time must be greater than start time');
    }
  }

  // Validate time range against video duration
  if (inputFile?.metadata?.duration) {
    if (options.endTime !== undefined && options.endTime > inputFile.metadata.duration) {
      errors.push('End time exceeds video duration');
    }
    if (options.startTime !== undefined && options.startTime >= inputFile.metadata.duration) {
      errors.push('Start time exceeds video duration');
    }
  }

  // Validate crop parameters
  if (options.cropParams) {
    const { x, y, width, height } = options.cropParams;
    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      errors.push('Invalid crop parameters');
    }

    // Validate crop against input dimensions
    if (inputFile?.metadata) {
      const { width: inputWidth, height: inputHeight } = inputFile.metadata;
      if (x + width > inputWidth || y + height > inputHeight) {
        errors.push('Crop parameters exceed input video dimensions');
      }
    }
  }

  return errors;
}

/**
 * Creates a quality preset configuration for the specified quality level
 * @param quality - Target video quality
 * @returns Quality preset configuration
 */
export function createQualityPreset(quality: VideoQuality): ConversionQualityPreset {
  const preset = QUALITY_PRESETS[quality];
  if (!preset) {
    throw new Error(`Unsupported video quality: ${quality}`);
  }

  return {
    quality,
    ...preset,
  };
}

/**
 * Estimates conversion time based on the request parameters
 * @param request - Conversion request
 * @returns Estimated conversion time in milliseconds
 */
export function estimateConversionTime(request: ConversionRequest): number {
  const { inputFile, targetQuality, options } = request;
  const inputMetadata = inputFile.metadata;
  
  // Base processing duration (video duration)
  let baseDuration = inputMetadata.duration;
  
  // Adjust for trimming
  if (options?.startTime !== undefined && options?.endTime !== undefined) {
    baseDuration = options.endTime - options.startTime;
  }
  
  // Calculate complexity factor based on quality change
  const inputQuality = getInputQuality(inputMetadata);
  const complexityFactor = calculateComplexityFactor(inputQuality, targetQuality);
  
  // Additional factors
  let additionalFactor = 1.0;
  
  // Cropping adds processing time
  if (options?.cropParams) {
    additionalFactor += 0.2; // 20% overhead for cropping
  }
  
  // Custom settings add processing time
  if (options?.customBitrate || options?.customFrameRate) {
    additionalFactor += 0.1; // 10% overhead for custom settings
  }
  
  // Calculate estimated time
  // Base formula: processing_time = video_duration * complexity_factor * additional_factor
  return Math.round(baseDuration * complexityFactor * additionalFactor);
}

/**
 * Determines input video quality based on metadata
 * @param metadata - Video metadata
 * @returns VideoQuality enum value
 */
function getInputQuality(metadata: any): VideoQuality {
  const maxDimension = Math.max(metadata.width, metadata.height);
  
  if (maxDimension >= 2160) return VideoQuality.UHD_4K;
  if (maxDimension >= 1920) return VideoQuality.FULL_HD;
  if (maxDimension >= 1280) return VideoQuality.HD;
  if (maxDimension >= 854) return VideoQuality.SD;
  return VideoQuality.LOW;
}

/**
 * Calculates complexity factor based on quality conversion
 * @param fromQuality - Input quality
 * @param toQuality - Output quality
 * @returns Complexity factor (multiplier for processing time)
 */
function calculateComplexityFactor(fromQuality: VideoQuality, toQuality: VideoQuality): number {
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
    return 1.0; // Default factor
  }
  
  // Quality downgrade is faster
  if (toIndex < fromIndex) {
    return 0.3 + (0.1 * (fromIndex - toIndex)); // 0.3 to 0.7 range
  }
  
  // Same quality
  if (toIndex === fromIndex) {
    return 0.8; // Slight overhead for re-encoding
  }
  
  // Quality upgrade is slower
  return 1.2 + (0.3 * (toIndex - fromIndex)); // 1.2 to 2.4 range
}

/**
 * Validates an output file path
 * @param path - Output file path to validate
 * @returns True if valid, false otherwise
 */
export function validateOutputPath(path: string): boolean {
  if (!path || path.trim() === '') {
    return false;
  }
  
  // Check for file extension
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(path);
  if (!hasExtension) {
    return false;
  }
  
  // Check for absolute path (Android paths)
  const isAbsolute = path.startsWith('/') || path.startsWith('file://');
  if (!isAbsolute) {
    return false;
  }
  
  // Check for invalid characters (basic validation)
  const invalidChars = /[?*<>|"]/;
  if (invalidChars.test(path)) {
    return false;
  }
  
  // Check for spaces (can cause issues in some contexts)
  if (path.includes(' ')) {
    return false;
  }
  
  return true;
}

/**
 * Gets default conversion options
 * @param overrides - Optional overrides for default values
 * @returns Default conversion options with any overrides applied
 */
export function getDefaultConversionOptions(overrides?: Partial<ConversionOptions>): ConversionOptions {
  const defaults: ConversionOptions = {
    preserveAudio: true,
    startTime: 0,
  };
  
  return { ...defaults, ...overrides };
}