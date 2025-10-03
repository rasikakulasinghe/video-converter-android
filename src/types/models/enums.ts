/**
 * Common enums for Video Converter Android App
 * Separated to prevent circular dependencies
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
