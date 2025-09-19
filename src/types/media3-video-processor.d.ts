declare module 'react-native' {
  namespace NativeModules {
    interface Media3VideoProcessor {
      convertVideo(sessionId: string, config: Media3ConversionConfig): Promise<string>;
      analyzeVideo(filePath: string): Promise<Media3AnalysisResult>;
      cancelConversion(sessionId: string): Promise<boolean>;
      getCapabilities(): Promise<Media3Capabilities>;

      // Event constants
      EVENT_CONVERSION_PROGRESS: string;
      EVENT_CONVERSION_COMPLETE: string;
      EVENT_CONVERSION_ERROR: string;
      EVENT_ANALYSIS_COMPLETE: string;
    }
  }
}

// Media3-specific configuration types
export interface Media3ConversionConfig {
  inputPath: string;
  outputPath: string;
  quality?: {
    width: number;
    height: number;
    bitrate?: number;
    frameRate?: number;
  };
  trim?: {
    startTime: number;
    endTime: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  preserveAudio?: boolean;
}

export interface Media3AnalysisResult {
  isValid: boolean;
  metadata: {
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    frameRate: number;
    codec: string;
    codecName: string;
  };
  supportedFormats: string[];
  recommendedQuality: string;
  estimatedProcessingTime: number;
}

export interface Media3Capabilities {
  supportedInputFormats: string[];
  supportedOutputFormats: string[];
  supportedQualities: string[];
  supportsHardwareAcceleration: boolean;
  supportsHDR: boolean;
  maxConcurrentSessions: number;
}

export interface Media3ProgressEvent {
  sessionId: string;
  progress: number;
  timestamp: number;
}

export interface Media3CompleteEvent {
  sessionId: string;
  duration: number;
  fileSize: number;
  timestamp: number;
}

export interface Media3ErrorEvent {
  sessionId: string;
  error: string;
  errorType: string;
  timestamp: number;
}