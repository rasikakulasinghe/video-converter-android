/**
 * Main types index file for Video Converter Android App
 */

// Import enums to use in interfaces
import { VideoFormat } from './enums';

// Export enums from separate file to prevent circular dependencies
export { VideoQuality, VideoFormat, OutputFormat } from './enums';

// Export ConversionStatus from ConversionJob
export { ConversionStatus } from './ConversionJob';

// Export ThermalState from DeviceCapabilities
export { ThermalState } from './DeviceCapabilities';

// Export AppSettings enums
export { OutputQuality, CompressionLevel, Theme, StorageLocation, PerformanceMode } from './AppSettings';

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

// Export ConversionJob types (includes ConversionProgress, ConversionSettings)
export type {
  ConversionProgress,
  ConversionSettings,
  ConversionRequest,
  ConversionResult,
  ConversionJob,
  ConversionQueue,
  BatchConversionConfig
} from './ConversionJob';

// Export ConversionResult utility types and functions
export type {
  ConversionSessionResult,
  ConversionError,
  ConversionResultValidationResult
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
