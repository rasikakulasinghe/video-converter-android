# Data Model: Mobile Video Converter Android App

**Date**: September 17, 2025  
**Feature**: Mobile Video Converter Android App  
**Status**: Complete

## Overview

This document defines the data entities, their relationships, and validation rules for the Mobile Video Converter Android application. The app operates entirely offline with local device storage, requiring no external database or cloud services.

## Core Entities

### 1. VideoFile

Represents both source and converted video files with comprehensive metadata.

```typescript
interface VideoFile {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Display name for the file
  originalName: string;          // Original filename with extension
  path: string;                  // Absolute file path on device
  size: number;                  // File size in bytes
  duration: number;              // Video duration in seconds
  format: VideoFormat;           // Video format information
  resolution: Resolution;        // Video resolution
  created: Date;                 // File creation timestamp
  modified: Date;                // Last modified timestamp
  isConverted: boolean;          // Whether this is a converted file
  sourceFileId?: string;         // Reference to source file if converted
  thumbnail?: string;            // Base64 encoded thumbnail image
}

interface VideoFormat {
  container: string;             // e.g., "mp4", "avi", "mov"
  videoCodec: string;            // e.g., "h264", "hevc", "vp9"
  audioCodec: string;            // e.g., "aac", "mp3", "opus"
  bitrate: number;               // Total bitrate in kbps
  fps: number;                   // Frames per second
}

interface Resolution {
  width: number;                 // Video width in pixels
  height: number;                // Video height in pixels
  aspectRatio: string;           // e.g., "16:9", "4:3", "1:1"
}
```

**Validation Rules**:
- `id` must be a valid UUID v4
- `name` cannot be empty and must be <= 255 characters
- `path` must be an absolute path and file must exist
- `size` must be > 0
- `duration` must be >= 0
- `resolution.width` and `resolution.height` must be > 0
- `created` and `modified` dates must be valid

**State Transitions**:
- New file: `isConverted = false`, no `sourceFileId`
- Converted file: `isConverted = true`, has valid `sourceFileId`

### 2. ConversionJob

Represents an active or completed video conversion process with progress tracking and resource usage.

```typescript
interface ConversionJob {
  id: string;                    // Unique identifier (UUID)
  sourceFileId: string;          // Reference to source VideoFile
  outputFileId?: string;         // Reference to output VideoFile (when complete)
  status: ConversionStatus;      // Current conversion status
  progress: ConversionProgress;  // Detailed progress information
  settings: ConversionSettings;  // User-selected conversion settings
  resourceUsage: ResourceUsage;  // Device resource tracking
  created: Date;                 // Job creation timestamp
  started?: Date;                // Processing start timestamp
  completed?: Date;              // Processing completion timestamp
  error?: ConversionError;       // Error information if failed
}

enum ConversionStatus {
  QUEUED = "queued",
  PREPARING = "preparing",
  CONVERTING = "converting",
  FINALIZING = "finalizing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed"
}

interface ConversionProgress {
  percentage: number;            // Completion percentage (0-100)
  currentFrame: number;          // Current frame being processed
  totalFrames: number;           // Total frames in video
  estimatedTimeRemaining: number; // Estimated seconds remaining
  processingSpeed: number;       // Frames per second processing rate
  outputSize: number;            // Current output file size in bytes
}

interface ConversionSettings {
  quality: QualityLevel;         // User-selected quality level
  outputFormat: OutputFormat;    // Target output format
  compressionLevel: number;      // Compression intensity (1-10)
  maintainAspectRatio: boolean;  // Whether to maintain original aspect ratio
  maxResolution?: Resolution;    // Maximum output resolution
}

enum QualityLevel {
  HIGH = "high",
  MEDIUM = "medium", 
  LOW = "low"
}

interface OutputFormat {
  container: "mp4";              // Always MP4 for web optimization
  videoCodec: "h264";            // Always H.264 for compatibility
  audioCodec: "aac";             // Always AAC for web compatibility
  targetBitrate: number;         // Target bitrate in kbps
}

interface ResourceUsage {
  cpuUsage: number;              // CPU usage percentage (0-100)
  memoryUsage: number;           // Memory usage in MB
  batteryDrain: number;          // Battery usage rate (mA)
  temperature: number;           // Device temperature in Celsius
  thermalThrottling: boolean;    // Whether thermal throttling is active
}

interface ConversionError {
  code: string;                  // Error code for categorization
  message: string;               // Human-readable error message
  details?: string;              // Technical error details
  timestamp: Date;               // When the error occurred
}
```

**Validation Rules**:
- `sourceFileId` must reference an existing VideoFile
- `progress.percentage` must be between 0 and 100
- `progress.currentFrame` must be <= `progress.totalFrames`
- `settings.compressionLevel` must be between 1 and 10
- `resourceUsage` values must be within realistic ranges
- Status transitions must follow valid flow: QUEUED → PREPARING → CONVERTING → FINALIZING → COMPLETED/FAILED/CANCELLED

**State Transitions**:
1. **QUEUED**: Job created, waiting to start
2. **PREPARING**: Analyzing source file, setting up conversion
3. **CONVERTING**: Active video processing
4. **FINALIZING**: Saving output file, updating metadata
5. **COMPLETED**: Successfully finished
6. **CANCELLED**: User-initiated cancellation
7. **FAILED**: Error occurred during processing

### 3. AppSettings

User preferences and application configuration with persistence.

```typescript
interface AppSettings {
  id: "app_settings";            // Singleton identifier
  general: GeneralSettings;      // General app preferences
  conversion: DefaultConversionSettings; // Default conversion preferences
  device: DeviceSettings;        // Device-specific settings
  ui: UISettings;                // User interface preferences
  storage: StorageSettings;      // File storage preferences
  lastUpdated: Date;             // Settings last modified timestamp
}

interface GeneralSettings {
  autoSaveToGallery: boolean;    // Automatically save converted videos to gallery
  enableHapticFeedback: boolean; // Haptic feedback for interactions
  enableNotifications: boolean;  // Background processing notifications
  askBeforeCancel: boolean;      // Confirm before cancelling conversions
}

interface DefaultConversionSettings {
  quality: QualityLevel;         // Default quality level
  compressionLevel: number;      // Default compression level (1-10)
  outputLocation: OutputLocation; // Where to save converted files
}

enum OutputLocation {
  GALLERY = "gallery",           // Save to device gallery
  APP_FOLDER = "app_folder",     // Save to dedicated app folder
  ASK_EACH_TIME = "ask_each_time" // Prompt user for each conversion
}

interface DeviceSettings {
  enableThermalThrottling: boolean; // Enable automatic thermal management
  thermalThresholdCelsius: number;  // Temperature threshold for throttling
  batteryThresholdPercent: number;  // Battery level to show warnings
  maxMemoryUsageMB: number;         // Maximum memory usage limit
  enableBackgroundProcessing: boolean; // Allow background conversion
}

interface UISettings {
  theme: ThemeMode;              // App theme preference
  language: string;              // App language (ISO 639-1 code)
  showAdvancedOptions: boolean;  // Show advanced conversion options
  animationsEnabled: boolean;    // Enable UI animations
}

enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system"              // Follow system theme
}

interface StorageSettings {
  maxCacheSize: number;          // Maximum cache size in MB
  autoCleanupDays: number;       // Days to keep temporary files
  warnLowStorageMB: number;      // Storage threshold for warnings
}
```

**Validation Rules**:
- `general.autoSaveToGallery` requires storage permissions
- `device.thermalThresholdCelsius` must be between 60-85°C
- `device.batteryThresholdPercent` must be between 5-50%
- `device.maxMemoryUsageMB` must be > 50MB and < total device memory
- `ui.language` must be a valid ISO 639-1 language code
- `storage.maxCacheSize` must be > 100MB
- `storage.autoCleanupDays` must be between 1-30 days

### 4. DeviceResources

Real-time system monitoring data for resource management during conversion.

```typescript
interface DeviceResources {
  id: string;                    // Measurement identifier (timestamp-based)
  timestamp: Date;               // When measurement was taken
  battery: BatteryInfo;          // Battery status and usage
  memory: MemoryInfo;            // Memory usage information
  storage: StorageInfo;          // Storage capacity and usage
  thermal: ThermalInfo;          // Temperature and thermal state
  network: NetworkInfo;          // Network connectivity (for future features)
}

interface BatteryInfo {
  level: number;                 // Battery level percentage (0-100)
  charging: boolean;             // Whether device is charging
  temperature: number;           // Battery temperature in Celsius
  voltage: number;               // Battery voltage in volts
  health: BatteryHealth;         // Battery health status
}

enum BatteryHealth {
  GOOD = "good",
  OVERHEAT = "overheat",
  DEAD = "dead",
  OVER_VOLTAGE = "over_voltage",
  UNKNOWN = "unknown"
}

interface MemoryInfo {
  totalRAM: number;              // Total device RAM in MB
  availableRAM: number;          // Available RAM in MB
  usedByApp: number;             // Memory used by this app in MB
  usagePercentage: number;       // Memory usage percentage (0-100)
  lowMemoryWarning: boolean;     // System low memory warning active
}

interface StorageInfo {
  totalInternal: number;         // Total internal storage in MB
  availableInternal: number;     // Available internal storage in MB
  totalExternal?: number;        // Total external storage in MB (if available)
  availableExternal?: number;    // Available external storage in MB
  appCacheSize: number;          // Current app cache size in MB
}

interface ThermalInfo {
  cpuTemperature: number;        // CPU temperature in Celsius
  batteryTemperature: number;    // Battery temperature in Celsius
  thermalState: ThermalState;    // Current thermal throttling state
  recommendedAction: ThermalAction; // Recommended action based on thermal state
}

enum ThermalState {
  NORMAL = "normal",             // Normal operating temperature
  WARM = "warm",                 // Elevated but safe temperature
  HOT = "hot",                   // High temperature, consider throttling
  CRITICAL = "critical"          // Critical temperature, must throttle
}

enum ThermalAction {
  CONTINUE = "continue",         // Safe to continue processing
  REDUCE_SPEED = "reduce_speed", // Reduce processing speed
  PAUSE = "pause",               // Pause processing temporarily
  STOP = "stop"                  // Stop processing immediately
}

interface NetworkInfo {
  connected: boolean;            // Whether device has network connectivity
  type: NetworkType;             // Type of network connection
  strength?: number;             // Signal strength (0-100) if applicable
}

enum NetworkType {
  NONE = "none",
  WIFI = "wifi",
  CELLULAR = "cellular",
  ETHERNET = "ethernet",
  UNKNOWN = "unknown"
}
```

**Validation Rules**:
- All percentage values must be between 0 and 100
- Temperature values must be within realistic ranges (-20°C to 100°C)
- Memory values must be positive and `usedByApp` <= `availableRAM`
- Storage values must be positive and available <= total
- `timestamp` must not be in the future

## Entity Relationships

```
VideoFile (1) ←──→ (0..n) ConversionJob
    ↑                      ↓
    └── sourceFileId ──────┘
    └── outputFileId ──────┘

AppSettings (1) ←── singleton

DeviceResources (n) ←── time series data
```

**Relationship Rules**:
- Each ConversionJob must reference exactly one source VideoFile
- Completed ConversionJobs should reference one output VideoFile
- VideoFiles can be sources for multiple ConversionJobs (re-conversion)
- AppSettings is a singleton entity with fixed ID
- DeviceResources are independent time-series measurements

## Data Persistence Strategy

### Local Storage
- **VideoFile metadata**: Stored in SQLite database for query performance
- **ConversionJob state**: Persisted in SQLite with automatic cleanup
- **AppSettings**: Stored in AsyncStorage for quick access
- **DeviceResources**: In-memory with optional SQLite for analytics

### File System
- **Video files**: Stored in appropriate Android directories
- **Thumbnails**: Cached in app-specific storage
- **Temporary files**: Automatically cleaned up after conversion

### Data Migration
- Version-based schema migrations for SQLite
- Settings migration for app updates
- Graceful handling of corrupted data

## Performance Considerations

### Indexing Strategy
- VideoFile: Index on `created`, `isConverted`, `sourceFileId`
- ConversionJob: Index on `status`, `created`, `sourceFileId`
- DeviceResources: Index on `timestamp` for cleanup queries

### Memory Management
- Lazy loading of video metadata
- Thumbnail caching with LRU eviction
- Batch processing for large video files
- Automatic cleanup of completed conversion jobs

### Data Validation
- Input validation at entity creation
- Business rule validation during state transitions
- Sanitization of user input for file names and paths
- Validation of file system permissions before operations

This data model provides a comprehensive foundation for the Mobile Video Converter Android app, ensuring data integrity, performance, and maintainability while supporting all functional requirements.