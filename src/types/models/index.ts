/**
 * Main types index file for Video Converter Android App
 */

// Export enums from separate file to prevent circular dependencies
export { VideoQuality, VideoFormat, OutputFormat } from './enums';

// Export ConversionStatus from ConversionJob
export { ConversionStatus } from './ConversionJob';

// Export ThermalState from DeviceCapabilities
export { ThermalState } from './DeviceCapabilities';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  codecName: string;
  audioCodec?: string;
  audioBitrate?: number;
  audioSampleRate?: number;
  audioChannels?: number;
}

export interface VideoFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  format: VideoFormat;
  createdAt: Date;
  modifiedAt: Date;
  metadata: VideoMetadata;
}

export interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm';
  audioCodec: 'aac' | 'mp3';
  preserveMetadata: boolean;
}

// Export all the main types
export type {
  ConversionRequest,
  ConversionValidationResult,
  ConversionQualityPreset,
  ConversionOptions,
  ConversionPriority
} from './ConversionRequest';

export type {
  ConversionResult,
  ConversionResultValidationResult,
  ConversionProgress,
  ConversionError
} from './ConversionResult';

export { ErrorSeverity } from './ConversionResult';

export type { VideoValidationResult } from './VideoFile';

// Export DeviceCapabilities types
export type {
  DeviceCapabilities,
  BatteryInfo,
  MemoryInfo,
  StorageInfo,
  ProcessorInfo,
  DevicePerformance,
  ProcessingCapability,
  QualityRecommendation,
  SuitabilityResult,
  StorageRecommendation,
  PauseRecommendation,
  ValidationResult
} from './DeviceCapabilities';
