// Enums
export enum SettingsCategory {
  APP = 'app',
  USER_PREFERENCES = 'user_preferences',
  VIDEO = 'video',
  AUDIO = 'audio',
  STORAGE = 'storage',
  DEVICE = 'device',
  SECURITY = 'security',
  ACCESSIBILITY = 'accessibility',
  EXPERIMENTAL = 'experimental',
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  ENUM = 'enum',
  DATE = 'date',
}

export enum QualityPreset {
  ULTRA = 'ultra',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  CUSTOM = 'custom',
}

export enum SettingsChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESET = 'reset',
  IMPORT = 'import',
}

export enum SettingsExportFormat {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  CSV = 'csv',
}

export enum ProfileType {
  SYSTEM = 'system',
  USER = 'user',
  CUSTOM = 'custom',
  DEVICE_OPTIMIZED = 'device_optimized',
}

export enum SettingsErrorType {
  INVALID_CATEGORY = 'invalid_category',
  INVALID_KEY = 'invalid_key',
  INVALID_VALUE = 'invalid_value',
  VALIDATION_FAILED = 'validation_failed',
  PERMISSION_DENIED = 'permission_denied',
  STORAGE_ERROR = 'storage_error',
  MIGRATION_FAILED = 'migration_failed',
  SCHEMA_MISMATCH = 'schema_mismatch',
  UNKNOWN_ERROR = 'unknown_error',
}

// Core settings interfaces
export interface AppSettings {
  version: string;
  language: string;
  theme: string; // 'light', 'dark', 'auto'
  autoSave: boolean;
  crashReporting: boolean;
  analytics: boolean;
  firstLaunch: boolean;
  lastUsed: Date;
  totalConversions: number;
  appRating: number | null;
  reviewPromptShown: boolean;
  isFirstLaunch?: boolean;
  daysSinceInstall?: number;
  conversionRate?: number;
}

export interface UserPreferences {
  defaultQuality: string;
  outputFormat: string;
  preferHardwareEncoding: boolean;
  autoStartConversion: boolean;
  showProgressNotifications: boolean;
  vibrationFeedback: boolean;
  soundEffects: boolean;
  keepScreenOn: boolean;
  lowPowerMode: boolean;
  customOutputPath: string | null;
  autoDeleteOriginals: boolean;
  backupSettings: boolean;
}

export interface VideoSettings {
  defaultCodec: string;
  fallbackCodec?: string;
  quality: QualityPreset;
  customQuality?: {
    bitrate: number;
    crf: number;
    preset: string;
  };
  resolution: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  framerate: number;
  keyframeInterval: number;
  bFrames: number;
  enableHardwareAcceleration: boolean;
  hardwareEncoder: string | null;
  enableGpuFiltering: boolean;
  maxFileSize: number | null;
  twoPassEncoding: boolean;
  interlaceMode: string;
}

export interface AudioSettings {
  codec: string;
  bitrate: number;
  sampleRate: number;
  channels: number;
  volume: number;
  normalization: boolean;
  noiseReduction: boolean;
  compressor: boolean;
  enablePassthrough: boolean;
}

export interface StorageSettings {
  defaultOutputPath: string;
  tempDirectory: string;
  maxTempSize: number;
  autoCleanupTemp: boolean;
  compressionLevel: number;
  reserveStorageSpace: number;
  moveToSdCard: boolean;
  createDateFolders: boolean;
}

export interface DeviceSettings {
  enableBackgroundProcessing: boolean;
  thermalThrottling: boolean;
  batteryOptimization: boolean;
  networkUsage: string; // 'wifi_only', 'cellular', 'any'
  cpuCoreLimit: number | null;
  memoryLimit: number | null;
  priorityMode: string; // 'background', 'normal', 'high'
}

export interface SecuritySettings {
  requireAuthentication: boolean;
  authenticationMethod: string; // 'biometric', 'pin', 'password'
  autoLockTimeout: number;
  encryptFiles: boolean;
  allowScreenshots: boolean;
  hideInRecents: boolean;
  secureKeystore: boolean;
}

export interface AccessibilitySettings {
  increasedTextSize: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceAnnouncements: boolean;
  hapticFeedback: boolean;
  simplifiedInterface: boolean;
  colorBlindMode: string | null;
}

export interface ExperimentalSettings {
  enableBetaFeatures: boolean;
  newEncodingEngine: boolean;
  advancedFilters: boolean;
  mlUpscaling: boolean;
  previewGeneration: boolean;
  batchProcessing: boolean;
  cloudSync: boolean;
  telemetryLevel: string; // 'none', 'basic', 'detailed'
}

// Settings utility types
export type SettingValue = string | number | boolean | object | Array<any> | Date | null;

export interface SettingDefinition {
  key: string;
  type: SettingType;
  defaultValue: SettingValue;
  description: string;
  category: SettingsCategory;
  constraints?: SettingConstraint;
  dependencies?: SettingsDependency[];
  isVisible: boolean;
  isEditable: boolean;
  requiresRestart: boolean;
  isExperimental: boolean;
}

export interface SettingConstraint {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: SettingValue[];
  customValidator?: string;
}

export interface SettingsDependency {
  key: string;
  category: SettingsCategory;
  condition: string; // 'equals', 'notEquals', 'greaterThan', etc.
  value: SettingValue;
  action: string; // 'show', 'hide', 'enable', 'disable'
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedSettings: Record<string, SettingValue> | null;
}

export interface SettingsBackup {
  id: string;
  timestamp: Date;
  version: string;
  deviceInfo: string;
  settings: Record<string, any>;
  checksum: string;
  isAutomatic: boolean;
  description?: string;
}

export interface SettingsRestoreResult {
  success: boolean;
  restoredCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  warnings: string[];
  backupInfo: {
    timestamp: Date;
    version: string;
    deviceInfo: string;
  };
}

export interface SettingsImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  warnings: string[];
  importedCategories: SettingsCategory[];
}

export interface SettingsChangeEvent {
  category: SettingsCategory;
  key: string;
  oldValue: SettingValue;
  newValue: SettingValue;
  changeType: SettingsChangeType;
  timestamp: Date;
  userId?: string;
  source?: string;
}

export interface ConfigurationProfile {
  id: string;
  name: string;
  description: string;
  type: ProfileType;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  lastModified: Date;
  settings: Record<string, any>;
  metadata?: {
    creator?: string;
    deviceOptimized?: boolean;
    tags?: string[];
    [key: string]: any;
  };
}

export interface SettingsSchema {
  version: string;
  categories: Record<SettingsCategory, SettingDefinition[]>;
  migrations: Array<{
    fromVersion: string;
    toVersion: string;
    migrationRules: Array<{
      action: string;
      source: string;
      target: string;
      transformer?: string;
    }>;
  }>;
}

// Error class
export class SettingsError extends Error {
  public readonly type: SettingsErrorType;
  public readonly code: string;
  public readonly details?: Record<string, any> | undefined;

  constructor(
    type: SettingsErrorType,
    message: string,
    code: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SettingsError';
    this.type = type;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SettingsError);
    }
  }
}

// Main service interface
export interface SettingsService {
  // Core settings operations
  getAllSettings(): Promise<Record<string, any>>;
  getSetting(category: SettingsCategory, key: string): Promise<SettingValue>;
  setSetting(category: SettingsCategory, key: string, value: SettingValue): Promise<boolean>;
  deleteSetting(category: SettingsCategory, key: string): Promise<boolean>;
  resetSetting(category: SettingsCategory, key: string): Promise<boolean>;
  resetAllSettings(categories?: SettingsCategory[]): Promise<boolean>;

  // Category-specific settings
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
  getUserPreferences(): Promise<UserPreferences>;
  updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences>;
  getVideoSettings(): Promise<VideoSettings>;
  updateVideoSettings(updates: Partial<VideoSettings>): Promise<VideoSettings>;
  getAudioSettings(): Promise<AudioSettings>;
  updateAudioSettings(updates: Partial<AudioSettings>): Promise<AudioSettings>;
  getStorageSettings(): Promise<StorageSettings>;
  updateStorageSettings(updates: Partial<StorageSettings>): Promise<StorageSettings>;
  getDeviceSettings(): Promise<DeviceSettings>;
  updateDeviceSettings(updates: Partial<DeviceSettings>): Promise<DeviceSettings>;
  getSecuritySettings(): Promise<SecuritySettings>;
  updateSecuritySettings(updates: Partial<SecuritySettings>): Promise<SecuritySettings>;
  getAccessibilitySettings(): Promise<AccessibilitySettings>;
  updateAccessibilitySettings(updates: Partial<AccessibilitySettings>): Promise<AccessibilitySettings>;
  getExperimentalSettings(): Promise<ExperimentalSettings>;
  updateExperimentalSettings(updates: Partial<ExperimentalSettings>): Promise<ExperimentalSettings>;

  // Validation and schema
  validateSettings(category: SettingsCategory, settings: Record<string, SettingValue>): Promise<SettingsValidationResult>;
  getSettingsSchema(): Promise<SettingsSchema>;
  getSettingDefinition(category: SettingsCategory, key: string): Promise<SettingDefinition | null>;
  checkSettingConstraints(category: SettingsCategory, key: string, value: SettingValue): Promise<boolean>;

  // Configuration profiles
  getActiveProfile(): Promise<ConfigurationProfile | null>;
  setActiveProfile(profileId: string): Promise<ConfigurationProfile>;
  createProfile(name: string, description: string, settings: Record<string, any>): Promise<ConfigurationProfile>;
  updateProfile(profileId: string, updates: Partial<ConfigurationProfile>): Promise<ConfigurationProfile>;
  deleteProfile(profileId: string): Promise<boolean>;
  listProfiles(type?: ProfileType): Promise<ConfigurationProfile[]>;
  duplicateProfile(profileId: string, newName: string): Promise<ConfigurationProfile>;

  // Settings persistence
  saveSettings(category?: SettingsCategory): Promise<boolean>;
  loadSettings(category?: SettingsCategory): Promise<boolean>;
  reloadSettings(): Promise<boolean>;
  isSettingsCacheValid(): Promise<boolean>;

  // Import/Export
  exportSettings(format: SettingsExportFormat, categories?: SettingsCategory[]): Promise<string>;
  importSettings(data: string, format?: SettingsExportFormat): Promise<SettingsImportResult>;
  backupSettings(description?: string): Promise<SettingsBackup>;
  restoreSettings(backupId: string): Promise<SettingsRestoreResult>;

  // Settings observation
  subscribeToChanges(categories: SettingsCategory[], callback: (event: SettingsChangeEvent) => void): Promise<string>;
  unsubscribeFromChanges(subscriptionId: string): Promise<boolean>;
  notifySettingChanged(event: SettingsChangeEvent): void;

  // Migration and versioning
  migrateSettings(fromVersion: string, settings: Record<string, any>): Promise<Record<string, any>>;
  getSettingsVersion(): Promise<string>;
  upgradeSettings(targetVersion?: string): Promise<boolean>;

  // Utilities
  isFirstLaunch(): Promise<boolean>;
  getDefaultSettings(category: SettingsCategory): Promise<Record<string, SettingValue>>;
  mergeSettings(base: Record<string, any>, override: Record<string, any>): Record<string, any>;
  compareSettings(settings1: Record<string, any>, settings2: Record<string, any>): Array<{
    key: string;
    category: SettingsCategory;
    value1: SettingValue;
    value2: SettingValue;
    isDifferent: boolean;
  }>;
}