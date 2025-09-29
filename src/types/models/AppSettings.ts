/**
 * AppSettings Model
 * 
 * Comprehensive application settings management for the Mobile Video Converter
 * Following constitutional requirements for TypeScript excellence and interfaces
 */

import { VideoFormat, OutputFormat } from './index';

/**
 * Output quality levels for video conversion
 */
export enum OutputQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

/**
 * Compression level options for encoding
 */
export enum CompressionLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum',
}

/**
 * Theme options for the application
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * Storage location options for converted videos
 */
export enum StorageLocation {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  DOWNLOADS = 'downloads',
  MOVIES = 'movies',
  CUSTOM = 'custom',
}

/**
 * Performance mode settings for device resource management
 */
export enum PerformanceMode {
  BATTERY_SAVER = 'battery_saver',
  BALANCED = 'balanced',
  PERFORMANCE = 'performance',
  MAXIMUM = 'maximum',
}

/**
 * Default conversion settings configuration
 */
export interface DefaultConversionSettings {
  /** Default output format for conversions */
  outputFormat: VideoFormat;
  /** Default quality setting */
  quality: OutputQuality;
  /** Default compression level */
  compression: CompressionLevel;
  /** Target bitrate in bits per second */
  targetBitrate: number;
  /** Maximum output width in pixels */
  maxWidth: number;
  /** Maximum output height in pixels */
  maxHeight: number;
  /** Whether to maintain aspect ratio during conversion */
  maintainAspectRatio: boolean;
  /** Whether to delete original file after successful conversion */
  deleteOriginalAfterConversion: boolean;
  /** Whether to automatically start conversion when file is selected */
  autoStartConversion: boolean;
  /** Optional frame rate override */
  frameRate?: number;
  /** Optional audio codec preference */
  audioCodec?: string;
  /** Optional video CRF (Constant Rate Factor) for quality control */
  videoCrf?: number;
  /** Optional FFmpeg preset for encoding speed/quality balance */
  preset?: string;
}

/**
 * Theme and visual customization settings
 */
export interface ThemeSettings {
  /** Current theme selection */
  theme: Theme;
  /** Whether to automatically follow system theme changes */
  followSystemTheme: boolean;
  /** Primary color in hex format */
  primaryColor: string;
  /** Accent color in hex format */
  accentColor: string;
  /** Whether animations are enabled */
  enableAnimations: boolean;
  /** Whether reduced motion is enabled for accessibility */
  reducedMotion: boolean;
  /** Optional custom color overrides */
  customColors?: {
    background?: string;
    surface?: string;
    text?: string;
  };
  /** Optional font scale multiplier */
  fontScale?: number;
}

/**
 * Storage and file management settings
 */
export interface StorageSettings {
  /** Default location for storing converted videos */
  defaultLocation: StorageLocation;
  /** Custom path when using CUSTOM storage location */
  customPath: string;
  /** Maximum storage usage in bytes (0 = unlimited) */
  maxStorageUsage: number;
  /** Whether to enable automatic cleanup of old files */
  autoCleanup: boolean;
  /** Number of days after which to clean up files */
  cleanupAfterDays: number;
  /** Whether to compress old files instead of deleting */
  compressOldFiles: boolean;
  /** Optional cloud backup integration */
  enableCloudBackup?: boolean;
  /** Cloud provider identifier */
  cloudProvider?: string;
  /** Whether to sync settings across devices */
  syncSettings?: boolean;
}

/**
 * Performance and resource management settings
 */
export interface PerformanceSettings {
  /** Performance mode selection */
  mode: PerformanceMode;
  /** Maximum number of concurrent conversion jobs */
  maxConcurrentJobs: number;
  /** Whether background processing is enabled */
  enableBackgroundProcessing: boolean;
  /** Whether thermal throttling is enabled */
  thermalThrottling: boolean;
  /** Whether battery optimization is enabled */
  batteryOptimization: boolean;
  /** Maximum CPU usage percentage (0-100) */
  maxCpuUsage: number;
  /** Maximum memory usage in bytes */
  maxMemoryUsage: number;
  /** Optional priority boost for conversions */
  priorityBoost?: boolean;
  /** Whether to use hardware acceleration when available */
  useHardwareAcceleration?: boolean;
  /** Whether to enable GPU acceleration */
  gpuAcceleration?: boolean;
}

/**
 * Notification and alert settings
 */
export interface NotificationSettings {
  /** Whether notifications are enabled globally */
  enableNotifications: boolean;
  /** Whether to show progress notifications during conversion */
  showProgress: boolean;
  /** Whether to show completion notifications */
  showCompletion: boolean;
  /** Whether to show error notifications */
  showErrors: boolean;
  /** Whether notification sounds are enabled */
  soundEnabled: boolean;
  /** Whether notification vibration is enabled */
  vibrationEnabled: boolean;
  /** Whether progress notifications should be persistent */
  persistentProgress: boolean;
  /** Optional custom sound file path */
  customSoundPath?: string;
  /** Optional quiet hours configuration */
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
}

/**
 * Complete application settings structure
 */
export interface AppSettings {
  /** Application version */
  version: string;
  /** Timestamp of last settings update */
  lastUpdated: Date;
  /** Unique user identifier */
  userId: string;
  /** Default conversion settings */
  defaultConversion: DefaultConversionSettings;
  /** Theme and visual settings */
  theme: ThemeSettings;
  /** Storage and file management settings */
  storage: StorageSettings;
  /** Performance and resource settings */
  performance: PerformanceSettings;
  /** Notification settings */
  notifications: NotificationSettings;
  /** Optional language/locale setting */
  language?: string;
  /** Optional analytics opt-in */
  analyticsEnabled?: boolean;
  /** Optional debug mode flag */
  debugMode?: boolean;
  /** Optional beta features opt-in */
  betaFeatures?: boolean;
}

/**
 * Helper function to create default application settings
 */
export function createDefaultAppSettings(): AppSettings {
  return {
    version: '1.0.0',
    lastUpdated: new Date(),
    userId: 'default-user',
    defaultConversion: {
      outputFormat: VideoFormat.MP4,
      quality: OutputQuality.HIGH,
      compression: CompressionLevel.MEDIUM,
      targetBitrate: 2000000,
      maxWidth: 1920,
      maxHeight: 1080,
      maintainAspectRatio: true,
      deleteOriginalAfterConversion: false,
      autoStartConversion: false,
    },
    theme: {
      theme: Theme.SYSTEM,
      followSystemTheme: true,
      primaryColor: '#2f6690',
      accentColor: '#3a7ca5',
      enableAnimations: true,
      reducedMotion: false,
    },
    storage: {
      defaultLocation: StorageLocation.MOVIES,
      customPath: '/storage/emulated/0/VideoConverter',
      maxStorageUsage: 2000000000, // 2GB
      autoCleanup: true,
      cleanupAfterDays: 30,
      compressOldFiles: false,
    },
    performance: {
      mode: PerformanceMode.BALANCED,
      maxConcurrentJobs: 1,
      enableBackgroundProcessing: true,
      thermalThrottling: true,
      batteryOptimization: true,
      maxCpuUsage: 80,
      maxMemoryUsage: 512000000, // 512MB
    },
    notifications: {
      enableNotifications: true,
      showProgress: true,
      showCompletion: true,
      showErrors: true,
      soundEnabled: false,
      vibrationEnabled: true,
      persistentProgress: true,
    },
    language: 'en-US',
    analyticsEnabled: false,
    debugMode: false,
    betaFeatures: false,
  };
}

/**
 * Validates the structure and values of app settings
 */
export function validateAppSettings(settings: AppSettings): boolean {
  try {
    // Check required top-level properties
    if (!settings.version || !settings.lastUpdated || !settings.userId) {
      return false;
    }

    // Validate default conversion settings
    if (!settings.defaultConversion || 
        !Object.values(VideoFormat).includes(settings.defaultConversion.outputFormat) ||
        !Object.values(OutputQuality).includes(settings.defaultConversion.quality) ||
        !Object.values(CompressionLevel).includes(settings.defaultConversion.compression)) {
      return false;
    }

    // Validate theme settings
    if (!settings.theme || 
        !Object.values(Theme).includes(settings.theme.theme)) {
      return false;
    }

    // Validate storage settings
    if (!settings.storage || 
        !Object.values(StorageLocation).includes(settings.storage.defaultLocation)) {
      return false;
    }

    // Validate performance settings
    if (!settings.performance || 
        !Object.values(PerformanceMode).includes(settings.performance.mode)) {
      return false;
    }

    // Validate notification settings
    if (!settings.notifications) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Migrates app settings from one version to another
 */
export function migrateAppSettings(oldSettings: any, targetVersion: string): AppSettings {
  // Start with default settings
  const defaultSettings = createDefaultAppSettings();
  
  // Apply migration logic based on version
  if (oldSettings.version && oldSettings.version < '1.0.0') {
    // Handle migration from pre-1.0.0 versions
    return {
      ...defaultSettings,
      version: targetVersion,
      lastUpdated: new Date(),
      // Preserve any compatible settings
      userId: oldSettings.userId || defaultSettings.userId,
    };
  }
  
  // For same version or newer, merge settings
  return {
    ...defaultSettings,
    ...oldSettings,
    version: targetVersion,
    lastUpdated: new Date(),
  };
}

/**
 * Merges partial settings updates with existing settings
 */
export function mergeAppSettings(current: AppSettings, updates: Partial<AppSettings>): AppSettings {
  return {
    ...current,
    ...updates,
    lastUpdated: new Date(),
    // Deep merge nested objects
    defaultConversion: {
      ...current.defaultConversion,
      ...updates.defaultConversion,
    },
    theme: {
      ...current.theme,
      ...updates.theme,
    },
    storage: {
      ...current.storage,
      ...updates.storage,
    },
    performance: {
      ...current.performance,
      ...updates.performance,
    },
    notifications: {
      ...current.notifications,
      ...updates.notifications,
    },
  };
}