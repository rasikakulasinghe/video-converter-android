# Service Contracts: Mobile Video Converter Android App

**Date**: September 17, 2025  
**Feature**: Mobile Video Converter Android App  
**Status**: Complete

## Overview

This document defines the service interfaces (contracts) for the Mobile Video Converter Android application. Since this is an offline mobile app, these contracts represent internal service APIs rather than external HTTP endpoints.

## 1. VideoProcessorService

Primary service responsible for video conversion operations using FFmpeg Kit.

### Interface Definition

```typescript
interface VideoProcessorService {
  // Core conversion operations
  convertVideo(request: ConversionRequest): Promise<ConversionResult>;
  cancelConversion(jobId: string): Promise<void>;
  pauseConversion(jobId: string): Promise<void>;
  resumeConversion(jobId: string): Promise<void>;
  
  // Video analysis
  analyzeVideo(filePath: string): Promise<VideoMetadata>;
  generateThumbnail(filePath: string, timeOffset?: number): Promise<string>;
  validateVideoFile(filePath: string): Promise<ValidationResult>;
  
  // Progress monitoring
  getConversionProgress(jobId: string): ConversionProgress | null;
  subscribeToProgress(jobId: string, callback: ProgressCallback): () => void;
  
  // Configuration
  getSupportedFormats(): Promise<SupportedFormats>;
  getOptimalSettings(sourceMetadata: VideoMetadata): ConversionSettings;
}

interface ConversionRequest {
  sourceFilePath: string;
  outputFilePath: string;
  settings: ConversionSettings;
  jobId: string;
}

interface ConversionResult {
  success: boolean;
  outputFilePath?: string;
  outputMetadata?: VideoMetadata;
  error?: ConversionError;
  processingTime: number;
  resourceUsage: ResourceUsageStats;
}

interface VideoMetadata {
  duration: number;
  format: VideoFormat;
  resolution: Resolution;
  fileSize: number;
  bitrate: number;
  fps: number;
  hasAudio: boolean;
  hasVideo: boolean;
}

interface ValidationResult {
  isValid: boolean;
  isSupported: boolean;
  issues: ValidationIssue[];
  recommendations: string[];
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

interface SupportedFormats {
  input: string[];
  output: string[];
  codecs: {
    video: string[];
    audio: string[];
  };
}

interface ResourceUsageStats {
  peakMemoryMB: number;
  averageCpuPercent: number;
  totalProcessingTime: number;
  thermalImpact: ThermalImpact;
}

type ProgressCallback = (progress: ConversionProgress) => void;
```

### Contract Tests

```typescript
// VideoProcessorService.contract.test.ts
describe('VideoProcessorService Contract', () => {
  test('convertVideo returns ConversionResult with required fields', async () => {
    const result = await videoProcessor.convertVideo(mockRequest);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('processingTime');
    expect(result).toHaveProperty('resourceUsage');
  });

  test('analyzeVideo returns complete VideoMetadata', async () => {
    const metadata = await videoProcessor.analyzeVideo('/path/to/video.mp4');
    expect(metadata).toHaveProperty('duration');
    expect(metadata).toHaveProperty('format');
    expect(metadata).toHaveProperty('resolution');
    expect(metadata.duration).toBeGreaterThan(0);
  });

  test('progress subscription provides real-time updates', (done) => {
    const unsubscribe = videoProcessor.subscribeToProgress('job-1', (progress) => {
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
      done();
    });
    // Trigger conversion...
  });
});
```

## 2. FileManagerService

Service for comprehensive file system operations with Android Media Store integration.

### Interface Definition

```typescript
interface FileManagerService {
  // File operations
  selectVideoFromGallery(): Promise<VideoFile | null>;
  recordNewVideo(): Promise<VideoFile | null>;
  saveVideoToGallery(filePath: string, metadata: VideoMetadata): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  
  // File system management
  getAvailableStorage(): Promise<StorageInfo>;
  createTempFile(extension: string): Promise<string>;
  cleanupTempFiles(): Promise<void>;
  validateStoragePermissions(): Promise<PermissionStatus>;
  
  // Media store integration
  addToMediaStore(filePath: string, metadata: VideoMetadata): Promise<void>;
  removeFromMediaStore(filePath: string): Promise<void>;
  updateMediaStoreEntry(filePath: string, metadata: VideoMetadata): Promise<void>;
  
  // File monitoring
  watchFile(filePath: string, callback: FileWatchCallback): () => void;
  getFileStats(filePath: string): Promise<FileStats>;
}

interface VideoFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  lastModified: Date;
}

interface PermissionStatus {
  granted: boolean;
  canRequestAgain: boolean;
  deniedPermanently: boolean;
}

interface FileStats {
  size: number;
  created: Date;
  modified: Date;
  accessible: boolean;
  writable: boolean;
}

type FileWatchCallback = (event: FileWatchEvent) => void;

interface FileWatchEvent {
  type: 'created' | 'modified' | 'deleted';
  filePath: string;
  timestamp: Date;
}
```

### Contract Tests

```typescript
// FileManagerService.contract.test.ts
describe('FileManagerService Contract', () => {
  test('selectVideoFromGallery returns VideoFile or null', async () => {
    const result = await fileManager.selectVideoFromGallery();
    if (result) {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('path');
      expect(result.size).toBeGreaterThan(0);
    }
  });

  test('getAvailableStorage returns current storage info', async () => {
    const storage = await fileManager.getAvailableStorage();
    expect(storage).toHaveProperty('totalInternal');
    expect(storage).toHaveProperty('availableInternal');
    expect(storage.availableInternal).toBeLessThanOrEqual(storage.totalInternal);
  });

  test('createTempFile generates unique temporary file', async () => {
    const tempPath = await fileManager.createTempFile('.mp4');
    expect(tempPath).toMatch(/\.mp4$/);
    const stats = await fileManager.getFileStats(tempPath);
    expect(stats.accessible).toBe(true);
  });
});
```

## 3. DeviceMonitorService

Service for monitoring device resources and managing thermal/battery constraints.

### Interface Definition

```typescript
interface DeviceMonitorService {
  // Resource monitoring
  getCurrentResources(): Promise<DeviceResources>;
  startMonitoring(interval: number): void;
  stopMonitoring(): void;
  subscribeToResourceUpdates(callback: ResourceUpdateCallback): () => void;
  
  // Thermal management
  getThermalState(): Promise<ThermalInfo>;
  enableThermalThrottling(enable: boolean): void;
  subscribeToThermalAlerts(callback: ThermalAlertCallback): () => void;
  
  // Battery management
  getBatteryInfo(): Promise<BatteryInfo>;
  subscribeToLowBatteryAlerts(callback: BatteryAlertCallback): () => void;
  
  // Performance optimization
  getRecommendedProcessingSpeed(): Promise<ProcessingRecommendation>;
  shouldPauseProcessing(): Promise<boolean>;
  getOptimalConversionSettings(baseSettings: ConversionSettings): Promise<ConversionSettings>;
}

interface ProcessingRecommendation {
  speedMultiplier: number; // 0.1 to 1.0
  pauseRecommended: boolean;
  reason: string;
  estimatedSafetyDuration: number; // seconds
}

type ResourceUpdateCallback = (resources: DeviceResources) => void;
type ThermalAlertCallback = (alert: ThermalAlert) => void;
type BatteryAlertCallback = (alert: BatteryAlert) => void;

interface ThermalAlert {
  severity: ThermalState;
  temperature: number;
  recommendedAction: ThermalAction;
  message: string;
}

interface BatteryAlert {
  level: number;
  charging: boolean;
  estimatedTimeRemaining?: number;
  message: string;
}
```

### Contract Tests

```typescript
// DeviceMonitorService.contract.test.ts
describe('DeviceMonitorService Contract', () => {
  test('getCurrentResources returns complete device state', async () => {
    const resources = await deviceMonitor.getCurrentResources();
    expect(resources).toHaveProperty('battery');
    expect(resources).toHaveProperty('memory');
    expect(resources).toHaveProperty('thermal');
    expect(resources.battery.level).toBeGreaterThanOrEqual(0);
    expect(resources.battery.level).toBeLessThanOrEqual(100);
  });

  test('getRecommendedProcessingSpeed adapts to device state', async () => {
    const recommendation = await deviceMonitor.getRecommendedProcessingSpeed();
    expect(recommendation.speedMultiplier).toBeGreaterThan(0);
    expect(recommendation.speedMultiplier).toBeLessThanOrEqual(1);
    expect(recommendation).toHaveProperty('reason');
  });

  test('thermal alerts trigger on temperature changes', (done) => {
    const unsubscribe = deviceMonitor.subscribeToThermalAlerts((alert) => {
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('temperature');
      expect(alert).toHaveProperty('recommendedAction');
      done();
    });
    // Simulate thermal state change...
  });
});
```

## 4. SettingsService

Service for managing user preferences and app configuration with persistence.

### Interface Definition

```typescript
interface SettingsService {
  // Settings management
  getSettings(): Promise<AppSettings>;
  updateSettings(updates: Partial<AppSettings>): Promise<void>;
  resetToDefaults(): Promise<void>;
  exportSettings(): Promise<string>; // JSON export
  importSettings(settingsJson: string): Promise<void>;
  
  // Specific setting operations
  getConversionDefaults(): Promise<DefaultConversionSettings>;
  updateConversionDefaults(settings: Partial<DefaultConversionSettings>): Promise<void>;
  getDeviceSettings(): Promise<DeviceSettings>;
  updateDeviceSettings(settings: Partial<DeviceSettings>): Promise<void>;
  
  // Settings validation
  validateSettings(settings: Partial<AppSettings>): ValidationResult;
  migrateSettings(fromVersion: string, toVersion: string): Promise<void>;
  
  // Change notifications
  subscribeToSettingsChanges(callback: SettingsChangeCallback): () => void;
}

interface SettingsChangeEvent {
  changedKeys: string[];
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: Date;
}

type SettingsChangeCallback = (event: SettingsChangeEvent) => void;
```

### Contract Tests

```typescript
// SettingsService.contract.test.ts
describe('SettingsService Contract', () => {
  test('getSettings returns complete AppSettings object', async () => {
    const settings = await settingsService.getSettings();
    expect(settings).toHaveProperty('general');
    expect(settings).toHaveProperty('conversion');
    expect(settings).toHaveProperty('device');
    expect(settings).toHaveProperty('ui');
  });

  test('updateSettings persists changes correctly', async () => {
    const updates = { general: { autoSaveToGallery: false } };
    await settingsService.updateSettings(updates);
    const settings = await settingsService.getSettings();
    expect(settings.general.autoSaveToGallery).toBe(false);
  });

  test('settings changes trigger notification callbacks', (done) => {
    const unsubscribe = settingsService.subscribeToSettingsChanges((event) => {
      expect(event).toHaveProperty('changedKeys');
      expect(event).toHaveProperty('newValues');
      expect(event.changedKeys.length).toBeGreaterThan(0);
      done();
    });
    settingsService.updateSettings({ ui: { theme: ThemeMode.DARK } });
  });
});
```

## Service Integration Contract

### Service Dependencies

```typescript
interface ServiceContainer {
  videoProcessor: VideoProcessorService;
  fileManager: FileManagerService;
  deviceMonitor: DeviceMonitorService;
  settings: SettingsService;
}

// Integration contract for cross-service operations
interface VideoConversionWorkflow {
  startConversion(sourceFile: VideoFile, settings: ConversionSettings): Promise<ConversionJob>;
  monitorConversion(job: ConversionJob): Promise<ConversionResult>;
  handleResourceConstraints(job: ConversionJob, resources: DeviceResources): Promise<void>;
}
```

### Integration Tests

```typescript
// Service integration contract tests
describe('Service Integration Contract', () => {
  test('complete video conversion workflow', async () => {
    // 1. Select video file
    const sourceFile = await fileManager.selectVideoFromGallery();
    expect(sourceFile).toBeDefined();
    
    // 2. Analyze video
    const metadata = await videoProcessor.analyzeVideo(sourceFile.path);
    expect(metadata).toBeDefined();
    
    // 3. Get optimal settings
    const settings = await videoProcessor.getOptimalSettings(metadata);
    expect(settings).toBeDefined();
    
    // 4. Check device resources
    const resources = await deviceMonitor.getCurrentResources();
    const shouldProceed = !await deviceMonitor.shouldPauseProcessing();
    expect(typeof shouldProceed).toBe('boolean');
    
    // 5. Start conversion
    const request: ConversionRequest = {
      sourceFilePath: sourceFile.path,
      outputFilePath: await fileManager.createTempFile('.mp4'),
      settings,
      jobId: 'test-job-1'
    };
    
    const result = await videoProcessor.convertVideo(request);
    expect(result.success).toBe(true);
  });
});
```

## Error Handling Contract

All services must implement consistent error handling:

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  retryAfter?: number;
}

// Standard error codes
enum ErrorCodes {
  // File operations
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INSUFFICIENT_STORAGE = 'INSUFFICIENT_STORAGE',
  
  // Video processing
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  PROCESSING_CANCELLED = 'PROCESSING_CANCELLED',
  
  // Device resources
  LOW_BATTERY = 'LOW_BATTERY',
  THERMAL_THROTTLING = 'THERMAL_THROTTLING',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  
  // Settings
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  MIGRATION_FAILED = 'MIGRATION_FAILED'
}
```

This contract specification provides a comprehensive foundation for implementing the Mobile Video Converter services with clear interfaces, comprehensive testing, and robust error handling.