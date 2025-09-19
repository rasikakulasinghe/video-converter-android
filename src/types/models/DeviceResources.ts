/**
 * @fileoverview DeviceResources model with comprehensive device monitoring
 * Handles device resource monitoring, thermal states, battery information,
 * network connectivity, and processing capabilities for video conversion.
 */

/**
 * Device type enumeration
 */
export enum DeviceType {
  PHONE = 'phone',
  TABLET = 'tablet',
  FOLDABLE = 'foldable',
  UNKNOWN = 'unknown',
}

/**
 * Network type enumeration
 */
export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  NONE = 'none',
  UNKNOWN = 'unknown',
}

/**
 * Thermal level enumeration
 */
export enum ThermalLevel {
  NORMAL = 'normal',
  LIGHT = 'light',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

/**
 * Battery state enumeration
 */
export enum BatteryState {
  CHARGING = 'charging',
  DISCHARGING = 'discharging',
  FULL = 'full',
  NOT_CHARGING = 'not_charging',
  UNKNOWN = 'unknown',
}

/**
 * Thermal state information
 */
export interface ThermalState {
  /** Current thermal level */
  level: ThermalLevel;
  /** Temperature in Celsius */
  temperature: number;
  /** Whether thermal throttling is active */
  isThrottling: boolean;
  /** Timestamp of last measurement */
  timestamp: Date;
}

/**
 * Battery information
 */
export interface BatteryInfo {
  /** Battery level (0.0 to 1.0) */
  level: number;
  /** Current battery state */
  state: BatteryState;
  /** Whether device is currently charging */
  isCharging: boolean;
  /** Battery health percentage (0.0 to 1.0) */
  health: number;
  /** Battery temperature in Celsius */
  temperature: number;
  /** Estimated time until full charge (minutes) */
  timeToFull?: number;
  /** Estimated time until battery depleted (minutes) */
  timeToEmpty?: number;
}

/**
 * Memory information
 */
export interface MemoryInfo {
  /** Total RAM in bytes */
  totalRam: number;
  /** Available RAM in bytes */
  availableRam: number;
  /** Used RAM in bytes */
  usedRam: number;
  /** Memory usage percentage (0.0 to 1.0) */
  usagePercentage: number;
  /** Low memory threshold in bytes */
  lowMemoryThreshold: number;
  /** Whether device is in low memory state */
  isLowMemory: boolean;
}

/**
 * Storage information
 */
export interface StorageInfo {
  /** Total storage in bytes */
  totalStorage: number;
  /** Available storage in bytes */
  availableStorage: number;
  /** Used storage in bytes */
  usedStorage: number;
  /** Storage usage percentage (0.0 to 1.0) */
  usagePercentage: number;
  /** Whether storage is critically low */
  isCriticallyLow: boolean;
  /** App's allocated storage in bytes */
  appStorage: number;
}

/**
 * Network information
 */
export interface NetworkInfo {
  /** Network type */
  type: NetworkType;
  /** Whether network is connected */
  isConnected: boolean;
  /** Whether network is metered */
  isMetered: boolean;
  /** Network speed estimation in Mbps */
  estimatedSpeed?: number;
  /** Signal strength (0.0 to 1.0) */
  signalStrength?: number;
}

/**
 * System information
 */
export interface SystemInfo {
  /** Device manufacturer */
  manufacturer: string;
  /** Device model */
  model: string;
  /** Operating system version */
  osVersion: string;
  /** API level (Android) */
  apiLevel: number;
  /** Device type */
  deviceType: DeviceType;
  /** CPU architecture */
  architecture: string;
  /** Number of CPU cores */
  cpuCores: number;
  /** CPU frequency in MHz */
  cpuFrequency: number;
  /** GPU renderer information */
  gpuRenderer?: string;
}

/**
 * Processing limits for video conversion
 */
export interface ProcessingLimits {
  /** Maximum concurrent conversions */
  maxConcurrentJobs: number;
  /** Maximum video resolution */
  maxResolution: {
    width: number;
    height: number;
  };
  /** Maximum video duration in seconds */
  maxDuration: number;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Recommended bitrate limit in bps */
  maxBitrate: number;
  /** Whether hardware acceleration is available */
  hardwareAcceleration: boolean;
}

/**
 * Device capabilities assessment
 */
export interface DeviceCapabilities {
  /** Processing power score (0.0 to 1.0) */
  processingPower: number;
  /** Available memory score (0.0 to 1.0) */
  memoryScore: number;
  /** Storage availability score (0.0 to 1.0) */
  storageScore: number;
  /** Battery health score (0.0 to 1.0) */
  batteryScore: number;
  /** Thermal health score (0.0 to 1.0) */
  thermalScore: number;
  /** Overall device score (0.0 to 1.0) */
  overallScore: number;
  /** Recommended quality level */
  recommendedQuality: 'low' | 'medium' | 'high';
  /** Processing limits */
  limits: ProcessingLimits;
}

/**
 * Complete device resources snapshot
 */
export interface DeviceResources {
  /** System information */
  system: SystemInfo;
  /** Battery information */
  battery: BatteryInfo;
  /** Memory information */
  memory: MemoryInfo;
  /** Storage information */
  storage: StorageInfo;
  /** Thermal state */
  thermal: ThermalState;
  /** Network information */
  network: NetworkInfo;
  /** Device capabilities */
  capabilities: DeviceCapabilities;
  /** Timestamp of resource snapshot */
  timestamp: Date;
  /** Whether device is suitable for processing */
  isSuitableForProcessing: boolean;
  /** Warnings about resource constraints */
  warnings: string[];
}

/**
 * Resource monitoring configuration
 */
export interface ResourceMonitorConfig {
  /** Monitoring interval in milliseconds */
  intervalMs: number;
  /** Battery level threshold for warnings */
  batteryWarningThreshold: number;
  /** Memory usage threshold for warnings */
  memoryWarningThreshold: number;
  /** Storage usage threshold for warnings */
  storageWarningThreshold: number;
  /** Temperature threshold for warnings in Celsius */
  temperatureWarningThreshold: number;
  /** Whether to auto-pause on low resources */
  autoPauseOnLowResources: boolean;
}

/**
 * Resource optimization recommendations
 */
export interface OptimizationRecommendations {
  /** Recommended video quality */
  quality: 'low' | 'medium' | 'high';
  /** Whether to enable hardware acceleration */
  useHardwareAcceleration: boolean;
  /** Recommended number of concurrent jobs */
  concurrentJobs: number;
  /** Whether to pause other apps */
  pauseOtherApps: boolean;
  /** Whether to wait for better conditions */
  waitForBetterConditions: boolean;
  /** Specific recommendations */
  recommendations: string[];
}