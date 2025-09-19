/**
 * Main types index file for Video Converter Android App
 */

export enum VideoQuality {
  LOW = '360p',
  SD = '480p', 
  HD = '720p',
  FULL_HD = '1080p',
  UHD_4K = '2160p',
}

export enum VideoFormat {
  MP4 = 'mp4',
  MOV = 'mov',
  AVI = 'avi',
  MKV = 'mkv',
  WEBM = 'webm',
  FLV = 'flv',
  WMV = 'wmv',
  M4V = 'm4v',
}

export enum OutputFormat {
  MP4 = 'MP4',
  MOV = 'MOV',
  AVI = 'AVI',
  MKV = 'MKV',
}

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
  ConversionOptions
} from './ConversionRequest';

export type {
  ConversionResult,
  ConversionResultValidationResult,
  ConversionProgress,
  ConversionError
} from './ConversionResult';

export { ErrorSeverity } from './ConversionResult';

export type { VideoValidationResult } from './VideoFile';
