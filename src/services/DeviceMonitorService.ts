// Enums
export enum ThermalState {
  NOMINAL = 'nominal',
  FAIR = 'fair',
  SERIOUS = 'serious',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
  SHUTDOWN = 'shutdown',
}

export enum PerformanceLimitType {
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  BATTERY_LEVEL = 'battery_level',
  THERMAL_STATE = 'thermal_state',
  STORAGE_SPACE = 'storage_space',
  NETWORK_SPEED = 'network_speed',
}

export enum ResourceAlertType {
  HIGH_CPU_USAGE = 'high_cpu_usage',
  HIGH_MEMORY_USAGE = 'high_memory_usage',
  LOW_BATTERY = 'low_battery',
  THERMAL_WARNING = 'thermal_warning',
  THERMAL_EMERGENCY = 'thermal_emergency',
  LOW_STORAGE = 'low_storage',
  MEMORY_PRESSURE = 'memory_pressure',
  PERFORMANCE_DEGRADED = 'performance_degraded',
}

export enum ResourceAlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum DeviceEventType {
  THERMAL_STATE_CHANGED = 'thermal_state_changed',
  BATTERY_LEVEL_CHANGED = 'battery_level_changed',
  MEMORY_PRESSURE_CHANGED = 'memory_pressure_changed',
  CPU_THROTTLING_STARTED = 'cpu_throttling_started',
  CPU_THROTTLING_STOPPED = 'cpu_throttling_stopped',
  POWER_STATE_CHANGED = 'power_state_changed',
  NETWORK_STATE_CHANGED = 'network_state_changed',
  STORAGE_WARNING = 'storage_warning',
  PERFORMANCE_PROFILE_CHANGED = 'performance_profile_changed',
}

export enum OptimizationType {
  PERFORMANCE = 'performance',
  POWER = 'power',
  THERMAL = 'thermal',
  MEMORY = 'memory',
  STORAGE = 'storage',
  NETWORK = 'network',
}

export enum HardwareFeature {
  HARDWARE_ENCODER = 'hardware_encoder',
  HARDWARE_DECODER = 'hardware_decoder',
  NEURAL_PROCESSING_UNIT = 'neural_processing_unit',
  GPU_ACCELERATION = 'gpu_acceleration',
  THERMAL_SENSORS = 'thermal_sensors',
  BATTERY_SENSORS = 'battery_sensors',
  ACCELEROMETER = 'accelerometer',
  GYROSCOPE = 'gyroscope',
  MAGNETOMETER = 'magnetometer',
  AMBIENT_LIGHT_SENSOR = 'ambient_light_sensor',
}

export enum DeviceMonitorErrorType {
  PERMISSION_DENIED = 'permission_denied',
  FEATURE_NOT_SUPPORTED = 'feature_not_supported',
  MONITORING_UNAVAILABLE = 'monitoring_unavailable',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  SESSION_CONFLICT = 'session_conflict',
  CONFIGURATION_INVALID = 'configuration_invalid',
  UNKNOWN_ERROR = 'unknown_error',
}

// Core interfaces
export interface BatteryInfo {
  level: number; // 0.0 to 1.0
  isCharging: boolean;
  chargingSource: string | null; // 'AC', 'USB', 'Wireless', null
  temperature: number; // Celsius
  voltage: number; // Volts
  health: string; // 'Good', 'Fair', 'Poor', 'Dead'
  timeRemaining: number | null; // seconds until empty
  estimatedTimeToFull: number | null; // seconds until full charge
  powerSaveMode: boolean;
}

export interface MemoryInfo {
  totalRAM: number; // bytes
  availableRAM: number; // bytes
  usedRAM: number; // bytes
  freeRAM: number; // bytes
  usagePercentage: number; // 0-100
  appMemoryUsage: number; // bytes used by this app
  systemMemoryUsage: number; // bytes used by system
  cacheMemoryUsage: number; // bytes used by cache
  swapUsage: number; // bytes used for swap
  memoryPressure: string; // 'normal', 'moderate', 'high', 'critical'
}

export interface DeviceStorageInfo {
  totalSpace: number; // bytes
  usedSpace: number; // bytes
  availableSpace: number; // bytes
  usagePercentage: number; // 0-100
  location: string; // 'internal', 'external', 'removable'
  path: string;
}

export interface CpuInfo {
  cores: number;
  architecture: string; // 'arm64', 'x86_64', etc.
  currentFrequency: number; // MHz
  maxFrequency: number; // MHz
  minFrequency: number; // MHz
  usage: number; // 0-100 percentage
  usagePerCore: number[]; // 0-100 percentage per core
  temperature: number; // Celsius
  governor: string; // 'performance', 'ondemand', 'powersave', etc.
  features: string[]; // CPU feature flags
  isThrottled?: boolean;
  throttleReason?: string;
}

export interface NetworkInfo {
  connectionType: string; // 'wifi', 'cellular', 'ethernet', 'none'
  isConnected: boolean;
  signalStrength: number; // 0-100 percentage
  networkSpeed: number; // Mbps
  isMetered: boolean;
  carrierName?: string;
  wifiSSID?: string;
  ipAddress?: string;
}

export interface PowerState {
  isScreenOn: boolean;
  isPowerSaveMode: boolean;
  isDozeMode: boolean;
  isInteractive: boolean;
  batteryOptimizationEnabled: boolean;
  thermalState: ThermalState;
}

// Performance and monitoring interfaces
export interface PerformanceLimit {
  maxCpuUsage: number; // percentage
  maxMemoryUsage: number; // percentage
  maxThermalThreshold: ThermalState;
  maxBatteryDrain: number; // percentage per hour
  minBatteryLevel: number; // percentage
}

export interface DevicePerformanceProfile {
  name: string;
  displayName: string;
  description: string;
  cpuProfile: string; // 'performance', 'balanced', 'powersave', 'ondemand'
  gpuProfile: string; // 'high', 'balanced', 'low'
  memoryProfile: string; // 'aggressive', 'normal', 'conservative'
  thermalProfile: string; // 'aggressive', 'moderate', 'conservative'
  powerProfile: string; // 'performance', 'balanced', 'battery_saver'
  limits: PerformanceLimit;
  isActive: boolean;
  isCustom: boolean;
}

export interface ResourceThreshold {
  type: PerformanceLimitType;
  value: number | ThermalState;
  unit: string; // 'percentage', 'bytes', 'state', 'celsius'
  action: string; // 'alert', 'throttle', 'pause', 'stop'
  enabled: boolean;
}

export interface ResourceAlert {
  id: string;
  type: ResourceAlertType;
  severity: ResourceAlertSeverity;
  message: string;
  timestamp: Date;
  value: number | ThermalState;
  threshold: number | ThermalState;
  recommendation: string;
  isActive: boolean;
  acknowledgedAt?: Date;
}

export interface MonitoringConfig {
  interval: number; // milliseconds between samples
  enableAlerts: boolean;
  thresholds?: {
    cpu?: number;
    memory?: number;
    battery?: number;
    thermal?: ThermalState;
    storage?: number;
  };
  features: string[]; // which features to monitor
  customSettings?: Record<string, any>;
}

export interface MonitoringSession {
  id: string;
  type: string; // 'thermal', 'battery', 'memory', 'comprehensive', 'custom'
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  config: MonitoringConfig;
  metrics?: {
    samplesCollected: number;
    alertsTriggered: number;
    peakCpuUsage: number;
    peakMemoryUsage: number;
    thermalEvents: number;
  };
}

export interface DeviceEvent {
  type: DeviceEventType;
  timestamp: Date;
  data: Record<string, any>;
}

export interface DeviceHealthStatus {
  overallHealth: string; // 'excellent', 'good', 'fair', 'poor', 'critical'
  thermalHealth: string;
  batteryHealth: string;
  memoryHealth: string;
  storageHealth: string;
  performanceHealth: string;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  lastChecked: Date;
}

export interface FeatureAvailability {
  feature: HardwareFeature;
  isAvailable: boolean;
  isEnabled: boolean;
  supportLevel: string; // 'none', 'basic', 'partial', 'full'
  reason?: string;
  details?: Record<string, any>;
}

export interface DeviceCapabilityCheck {
  canEncodeVideo: boolean;
  canDecodeVideo: boolean;
  supportedCodecs: string[];
  maxVideoResolution: string;
  maxFrameRate: number;
  supportsHardwareAcceleration: boolean;
  thermalMonitoringAvailable: boolean;
  batteryMonitoringAvailable: boolean;
  memoryMonitoringAvailable: boolean;
}

export interface ResourceUsageSnapshot {
  timestamp: Date;
  thermal: {
    state: ThermalState;
    temperature: number;
  };
  battery: {
    level: number;
    isCharging: boolean;
    temperature: number;
    powerSaveMode: boolean;
  };
  memory: {
    totalRAM: number;
    usedRAM: number;
    usagePercentage: number;
    memoryPressure: string;
  };
  cpu: {
    usage: number;
    temperature: number;
    frequency: number;
    cores: number;
  };
  storage: {
    totalSpace: number;
    usedSpace: number;
    usagePercentage: number;
  };
  network: {
    connectionType: string;
    signalStrength: number;
    isMetered: boolean;
  };
  performanceScore: number;
  healthScore: number;
}

export interface PerformanceMetrics {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  averageCpuUsage: number;
  peakCpuUsage: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  thermalEvents: number;
  batteryDrain: number;
  alertsTriggered: number;
  performanceScore: number;
}

export interface OptimizationRecommendation {
  type: OptimizationType;
  priority: string; // 'low', 'medium', 'high', 'critical'
  title: string;
  description: string;
  impact: string;
  steps: string[];
  estimatedBenefit?: {
    performanceGain?: number;
    powerSavings?: number;
    thermalReduction?: number;
    memoryFreed?: number;
    stabilityImprovement?: number;
  };
}

// Error class
export class DeviceMonitorError extends Error {
  public readonly type: DeviceMonitorErrorType;
  public readonly code: string;
  public readonly details?: Record<string, any> | undefined;

  constructor(
    type: DeviceMonitorErrorType,
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DeviceMonitorError';
    this.type = type;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DeviceMonitorError);
    }
  }
}

// Main service interface
export interface DeviceMonitorService {
  // Thermal monitoring
  getThermalState(): Promise<ThermalState>;
  startThermalMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopThermalMonitoring(sessionId: string): Promise<void>;

  // Battery monitoring
  getBatteryInfo(): Promise<BatteryInfo>;
  startBatteryMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopBatteryMonitoring(sessionId: string): Promise<void>;

  // Memory monitoring
  getMemoryInfo(): Promise<MemoryInfo>;
  startMemoryMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopMemoryMonitoring(sessionId: string): Promise<void>;

  // Storage monitoring
  getStorageInfo(location?: string): Promise<DeviceStorageInfo>;
  startStorageMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopStorageMonitoring(sessionId: string): Promise<void>;

  // CPU monitoring
  getCpuInfo(): Promise<CpuInfo>;
  startCpuMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopCpuMonitoring(sessionId: string): Promise<void>;

  // Network monitoring
  getNetworkInfo(): Promise<NetworkInfo>;
  startNetworkMonitoring(callback: (event: DeviceEvent) => void, interval?: number): Promise<MonitoringSession>;
  stopNetworkMonitoring(sessionId: string): Promise<void>;

  // Performance profiling
  getPerformanceProfile(): Promise<DevicePerformanceProfile>;
  setPerformanceProfile(profileName: string): Promise<void>;
  optimizeForTask(taskType: string): Promise<DevicePerformanceProfile>;

  // Resource limits and thresholds
  setResourceThreshold(type: PerformanceLimitType, threshold: ResourceThreshold): Promise<void>;
  getResourceThreshold(type: PerformanceLimitType): Promise<ResourceThreshold | null>;
  clearResourceThreshold(type: PerformanceLimitType): Promise<void>;
  checkResourceLimits(): Promise<ResourceAlert[]>;

  // Device capabilities
  checkHardwareFeature(feature: HardwareFeature): Promise<FeatureAvailability>;
  getDeviceCapabilities(): Promise<DeviceCapabilityCheck>;
  supportsVideoEncoding(codec: string): Promise<boolean>;
  getMaxVideoResolution(): Promise<string>;

  // Health and status
  getDeviceHealth(): Promise<DeviceHealthStatus>;
  getPowerState(): Promise<PowerState>;
  isDeviceOverheating(): Promise<boolean>;
  isLowBattery(threshold?: number): Promise<boolean>;
  isLowMemory(threshold?: number): Promise<boolean>;
  isLowStorage(threshold?: number): Promise<boolean>;

  // Monitoring sessions
  startMonitoringSession(config: MonitoringConfig): Promise<MonitoringSession>;
  stopMonitoringSession(sessionId: string): Promise<PerformanceMetrics>;
  getMonitoringSession(sessionId: string): Promise<MonitoringSession | null>;

  // Events and alerts
  subscribeToEvents(eventTypes: DeviceEventType[], callback: (event: DeviceEvent) => void): Promise<string>;
  unsubscribeFromEvents(subscriptionId: string): Promise<void>;
  getActiveAlerts(): Promise<ResourceAlert[]>;
  dismissAlert(alertId: string): Promise<void>;

  // Performance optimization
  getOptimizationRecommendations(context?: string): Promise<OptimizationRecommendation[]>;
  applyOptimization(optimizationId: string): Promise<void>;
  resetOptimizations(): Promise<void>;

  // Resource snapshots
  takeResourceSnapshot(): Promise<ResourceUsageSnapshot>;
  getResourceHistory(sessionId: string, startTime?: Date, endTime?: Date): Promise<ResourceUsageSnapshot[]>;
  exportResourceData(sessionId: string, format: 'json' | 'csv'): Promise<string>;
}