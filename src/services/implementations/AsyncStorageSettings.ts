import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SettingsService,
  SettingsCategory,
  SettingType,
  QualityPreset,
  SettingsChangeType,
  SettingsExportFormat,
  ProfileType,
  SettingsErrorType,
  AppSettings,
  UserPreferences,
  VideoSettings,
  AudioSettings,
  StorageSettings,
  DeviceSettings,
  SecuritySettings,
  AccessibilitySettings,
  ExperimentalSettings,
  SettingValue,
  SettingDefinition,
  SettingConstraint,
  SettingsDependency,
  SettingsValidationResult,
  SettingsBackup,
  SettingsRestoreResult,
  SettingsImportResult,
  SettingsChangeEvent,
  ConfigurationProfile,
  SettingsSchema,
  SettingsError,
} from '../SettingsService';

/**
 * AsyncStorage-based implementation of SettingsService
 * Provides persistent settings storage using React Native AsyncStorage
 */
export class AsyncStorageSettings implements SettingsService {
  private static readonly STORAGE_PREFIX = '@VideoConverter:';
  private static readonly SETTINGS_VERSION = '1.0.0';
  private static readonly CACHE_TIMEOUT = 30 * 1000; // 30 seconds
  
  private settingsCache: Map<string, { value: any; timestamp: number }> = new Map();
  private changeSubscriptions: Map<string, {
    categories: SettingsCategory[];
    callback: (event: SettingsChangeEvent) => void;
  }> = new Map();
  private defaultSettings: Map<SettingsCategory, Record<string, SettingValue>> = new Map();

  constructor() {
    this.initializeDefaultSettings();
  }

  // Core settings operations
  async getAllSettings(): Promise<Record<string, any>> {
    const allKeys = await AsyncStorage.getAllKeys();
    const settingsKeys = allKeys.filter(key => key.startsWith(AsyncStorageSettings.STORAGE_PREFIX));
    
    if (settingsKeys.length === 0) {
      return {};
    }

    const keyValuePairs = await AsyncStorage.multiGet(settingsKeys);
    const settings: Record<string, any> = {};

    keyValuePairs.forEach(([key, value]) => {
      if (value) {
        try {
          const cleanKey = key.replace(AsyncStorageSettings.STORAGE_PREFIX, '');
          settings[cleanKey] = JSON.parse(value);
        } catch (error) {
          console.warn(`Failed to parse setting ${key}:`, error);
        }
      }
    });

    return settings;
  }

  async getSetting(category: SettingsCategory, key: string): Promise<SettingValue> {
    const fullKey = this.getStorageKey(category, key);
    
    // Check cache first
    const cached = this.settingsCache.get(fullKey);
    if (cached && (Date.now() - cached.timestamp) < AsyncStorageSettings.CACHE_TIMEOUT) {
      return cached.value;
    }

    try {
      const value = await AsyncStorage.getItem(fullKey);
      if (value !== null) {
        const parsedValue = JSON.parse(value);
        this.settingsCache.set(fullKey, { value: parsedValue, timestamp: Date.now() });
        return parsedValue;
      }
    } catch (error) {
      console.warn(`Failed to get setting ${fullKey}:`, error);
    }

    // Return default value if not found
    const defaultValue = this.getDefaultValue(category, key);
    return defaultValue;
  }

  async setSetting(category: SettingsCategory, key: string, value: SettingValue): Promise<boolean> {
    try {
      const fullKey = this.getStorageKey(category, key);
      const oldValue = await this.getSetting(category, key);
      
      // Validate the value
      const isValid = await this.checkSettingConstraints(category, key, value);
      if (!isValid) {
        throw new SettingsError(
          SettingsErrorType.VALIDATION_FAILED,
          `Invalid value for setting ${key}`,
          'INVALID_SETTING_VALUE'
        );
      }

      // Store the value
      await AsyncStorage.setItem(fullKey, JSON.stringify(value));
      
      // Update cache
      this.settingsCache.set(fullKey, { value, timestamp: Date.now() });

      // Notify subscribers
      this.notifySettingChanged({
        category,
        key,
        oldValue,
        newValue: value,
        changeType: SettingsChangeType.UPDATE,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      return false;
    }
  }

  async deleteSetting(category: SettingsCategory, key: string): Promise<boolean> {
    try {
      const fullKey = this.getStorageKey(category, key);
      const oldValue = await this.getSetting(category, key);
      
      await AsyncStorage.removeItem(fullKey);
      this.settingsCache.delete(fullKey);

      // Notify subscribers
      this.notifySettingChanged({
        category,
        key,
        oldValue,
        newValue: null,
        changeType: SettingsChangeType.DELETE,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error);
      return false;
    }
  }

  async resetSetting(category: SettingsCategory, key: string): Promise<boolean> {
    const defaultValue = this.getDefaultValue(category, key);
    return this.setSetting(category, key, defaultValue);
  }

  async resetAllSettings(categories?: SettingsCategory[]): Promise<boolean> {
    try {
      const categoriesToReset = categories || Object.values(SettingsCategory);
      
      for (const category of categoriesToReset) {
        const defaults = this.defaultSettings.get(category) || {};
        for (const [key, value] of Object.entries(defaults)) {
          await this.setSetting(category, key, value);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  }

  // Category-specific settings
  async getAppSettings(): Promise<AppSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.APP);
    return settings as AppSettings;
  }

  async updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    await this.updateCategorySettings(SettingsCategory.APP, updates);
    return this.getAppSettings();
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const settings = await this.getCategorySettings(SettingsCategory.USER_PREFERENCES);
    return settings as UserPreferences;
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await this.updateCategorySettings(SettingsCategory.USER_PREFERENCES, updates);
    return this.getUserPreferences();
  }

  async getVideoSettings(): Promise<VideoSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.VIDEO);
    return settings as VideoSettings;
  }

  async updateVideoSettings(updates: Partial<VideoSettings>): Promise<VideoSettings> {
    await this.updateCategorySettings(SettingsCategory.VIDEO, updates);
    return this.getVideoSettings();
  }

  async getAudioSettings(): Promise<AudioSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.AUDIO);
    return settings as AudioSettings;
  }

  async updateAudioSettings(updates: Partial<AudioSettings>): Promise<AudioSettings> {
    await this.updateCategorySettings(SettingsCategory.AUDIO, updates);
    return this.getAudioSettings();
  }

  async getStorageSettings(): Promise<StorageSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.STORAGE);
    return settings as StorageSettings;
  }

  async updateStorageSettings(updates: Partial<StorageSettings>): Promise<StorageSettings> {
    await this.updateCategorySettings(SettingsCategory.STORAGE, updates);
    return this.getStorageSettings();
  }

  async getDeviceSettings(): Promise<DeviceSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.DEVICE);
    return settings as DeviceSettings;
  }

  async updateDeviceSettings(updates: Partial<DeviceSettings>): Promise<DeviceSettings> {
    await this.updateCategorySettings(SettingsCategory.DEVICE, updates);
    return this.getDeviceSettings();
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    const settings = await this.getCategorySettings(SettingsCategory.SECURITY);
    return settings as SecuritySettings;
  }

  async updateSecuritySettings(updates: Partial<SecuritySettings>): Promise<SecuritySettings> {
    await this.updateCategorySettings(SettingsCategory.SECURITY, updates);
    return this.getSecuritySettings();
  }

  async getAccessibilitySettings(): Promise<AccessibilitySettings> {
    const settings = await this.getCategorySettings(SettingsCategory.ACCESSIBILITY);
    return settings as AccessibilitySettings;
  }

  async updateAccessibilitySettings(updates: Partial<AccessibilitySettings>): Promise<AccessibilitySettings> {
    await this.updateCategorySettings(SettingsCategory.ACCESSIBILITY, updates);
    return this.getAccessibilitySettings();
  }

  async getExperimentalSettings(): Promise<ExperimentalSettings> {
    const settings = await this.getCategorySettings(SettingsCategory.EXPERIMENTAL);
    return settings as ExperimentalSettings;
  }

  async updateExperimentalSettings(updates: Partial<ExperimentalSettings>): Promise<ExperimentalSettings> {
    await this.updateCategorySettings(SettingsCategory.EXPERIMENTAL, updates);
    return this.getExperimentalSettings();
  }

  // Validation and schema
  async validateSettings(category: SettingsCategory, settings: Record<string, SettingValue>): Promise<SettingsValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedSettings: Record<string, SettingValue> = {};

    for (const [key, value] of Object.entries(settings)) {
      try {
        const isValid = await this.checkSettingConstraints(category, key, value);
        if (isValid) {
          validatedSettings[key] = value;
        } else {
          errors.push(`Invalid value for ${key}: ${value}`);
        }
      } catch (error) {
        errors.push(`Validation error for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedSettings: errors.length === 0 ? validatedSettings : null,
    };
  }

  async getSettingsSchema(): Promise<SettingsSchema> {
    // Simplified schema - in a real implementation, this would be more comprehensive
    return {
      version: AsyncStorageSettings.SETTINGS_VERSION,
      categories: {
        [SettingsCategory.APP]: this.getAppSettingsDefinitions(),
        [SettingsCategory.USER_PREFERENCES]: this.getUserPreferencesDefinitions(),
        [SettingsCategory.VIDEO]: this.getVideoSettingsDefinitions(),
        [SettingsCategory.AUDIO]: this.getAudioSettingsDefinitions(),
        [SettingsCategory.STORAGE]: this.getStorageSettingsDefinitions(),
        [SettingsCategory.DEVICE]: this.getDeviceSettingsDefinitions(),
        [SettingsCategory.SECURITY]: this.getSecuritySettingsDefinitions(),
        [SettingsCategory.ACCESSIBILITY]: this.getAccessibilitySettingsDefinitions(),
        [SettingsCategory.EXPERIMENTAL]: this.getExperimentalSettingsDefinitions(),
      },
      migrations: [],
    };
  }

  async getSettingDefinition(category: SettingsCategory, key: string): Promise<SettingDefinition | null> {
    const schema = await this.getSettingsSchema();
    const categoryDefinitions = schema.categories[category] || [];
    return categoryDefinitions.find(def => def.key === key) || null;
  }

  async checkSettingConstraints(category: SettingsCategory, key: string, value: SettingValue): Promise<boolean> {
    const definition = await this.getSettingDefinition(category, key);
    if (!definition) {
      return true; // No constraints if no definition found
    }

    const constraints = definition.constraints;
    if (!constraints) {
      return true;
    }

    // Type check
    if (!this.isValidType(value, definition.type)) {
      return false;
    }

    // Required check
    if (constraints.required && (value === null || value === undefined || value === '')) {
      return false;
    }

    // Range checks for numbers
    if (typeof value === 'number') {
      if (constraints.minValue !== undefined && value < constraints.minValue) {
        return false;
      }
      if (constraints.maxValue !== undefined && value > constraints.maxValue) {
        return false;
      }
    }

    // Length checks for strings
    if (typeof value === 'string') {
      if (constraints.minLength !== undefined && value.length < constraints.minLength) {
        return false;
      }
      if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
        return false;
      }
      if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
        return false;
      }
    }

    // Allowed values check
    if (constraints.allowedValues && !constraints.allowedValues.includes(value)) {
      return false;
    }

    return true;
  }

  // Configuration profiles
  async getActiveProfile(): Promise<ConfigurationProfile | null> {
    try {
      const profileId = await AsyncStorage.getItem(this.getStorageKey('system', 'activeProfile'));
      if (!profileId) {
        return null;
      }

      const profileData = await AsyncStorage.getItem(this.getStorageKey('profiles', profileId));
      if (!profileData) {
        return null;
      }

      return JSON.parse(profileData);
    } catch (error) {
      console.error('Failed to get active profile:', error);
      return null;
    }
  }

  async setActiveProfile(profileId: string): Promise<ConfigurationProfile> {
    try {
      const profileData = await AsyncStorage.getItem(this.getStorageKey('profiles', profileId));
      if (!profileData) {
        throw new SettingsError(
          SettingsErrorType.INVALID_KEY,
          'Profile not found',
          'PROFILE_NOT_FOUND'
        );
      }

      const profile: ConfigurationProfile = JSON.parse(profileData);
      
      // Mark this profile as active
      await AsyncStorage.setItem(this.getStorageKey('system', 'activeProfile'), profileId);
      
      // Apply the profile settings
      for (const [categoryKey, settings] of Object.entries(profile.settings)) {
        const category = categoryKey as SettingsCategory;
        for (const [key, value] of Object.entries(settings)) {
          await this.setSetting(category, key, value as SettingValue);
        }
      }

      return profile;
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to set active profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROFILE_ACTIVATION_FAILED'
      );
    }
  }

  async createProfile(name: string, description: string, settings: Record<string, any>): Promise<ConfigurationProfile> {
    const profile: ConfigurationProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type: ProfileType.USER,
      isActive: false,
      isDefault: false,
      createdAt: new Date(),
      lastModified: new Date(),
      settings,
    };

    try {
      await AsyncStorage.setItem(
        this.getStorageKey('profiles', profile.id),
        JSON.stringify(profile)
      );
      return profile;
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROFILE_CREATION_FAILED'
      );
    }
  }

  async updateProfile(profileId: string, updates: Partial<ConfigurationProfile>): Promise<ConfigurationProfile> {
    try {
      const profileData = await AsyncStorage.getItem(this.getStorageKey('profiles', profileId));
      if (!profileData) {
        throw new SettingsError(
          SettingsErrorType.INVALID_KEY,
          'Profile not found',
          'PROFILE_NOT_FOUND'
        );
      }

      const profile: ConfigurationProfile = JSON.parse(profileData);
      const updatedProfile = {
        ...profile,
        ...updates,
        lastModified: new Date(),
      };

      await AsyncStorage.setItem(
        this.getStorageKey('profiles', profileId),
        JSON.stringify(updatedProfile)
      );

      return updatedProfile;
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROFILE_UPDATE_FAILED'
      );
    }
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.getStorageKey('profiles', profileId));
      
      // If this was the active profile, clear the active profile
      const activeProfileId = await AsyncStorage.getItem(this.getStorageKey('system', 'activeProfile'));
      if (activeProfileId === profileId) {
        await AsyncStorage.removeItem(this.getStorageKey('system', 'activeProfile'));
      }

      return true;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return false;
    }
  }

  async listProfiles(type?: ProfileType): Promise<ConfigurationProfile[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const profileKeys = allKeys.filter(key => 
        key.startsWith(`${AsyncStorageSettings.STORAGE_PREFIX}profiles:`)
      );

      if (profileKeys.length === 0) {
        return [];
      }

      const keyValuePairs = await AsyncStorage.multiGet(profileKeys);
      const profiles: ConfigurationProfile[] = [];

      keyValuePairs.forEach(([_, value]) => {
        if (value) {
          try {
            const profile: ConfigurationProfile = JSON.parse(value);
            if (!type || profile.type === type) {
              profiles.push(profile);
            }
          } catch (error) {
            console.warn('Failed to parse profile:', error);
          }
        }
      });

      return profiles.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    } catch (error) {
      console.error('Failed to list profiles:', error);
      return [];
    }
  }

  async duplicateProfile(profileId: string, newName: string): Promise<ConfigurationProfile> {
    try {
      const profileData = await AsyncStorage.getItem(this.getStorageKey('profiles', profileId));
      if (!profileData) {
        throw new SettingsError(
          SettingsErrorType.INVALID_KEY,
          'Profile not found',
          'PROFILE_NOT_FOUND'
        );
      }

      const originalProfile: ConfigurationProfile = JSON.parse(profileData);
      
      return this.createProfile(
        newName,
        `Copy of ${originalProfile.description}`,
        originalProfile.settings
      );
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to duplicate profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PROFILE_DUPLICATION_FAILED'
      );
    }
  }

  // Settings persistence
  async saveSettings(category?: SettingsCategory): Promise<boolean> {
    // AsyncStorage automatically persists, so this is a no-op
    // In a more complex implementation, this might flush caches or batch writes
    return true;
  }

  async loadSettings(category?: SettingsCategory): Promise<boolean> {
    try {
      // Clear cache to force reload from storage
      if (category) {
        const keysToDelete = Array.from(this.settingsCache.keys()).filter(key =>
          key.includes(category)
        );
        keysToDelete.forEach(key => this.settingsCache.delete(key));
      } else {
        this.settingsCache.clear();
      }
      return true;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return false;
    }
  }

  async reloadSettings(): Promise<boolean> {
    return this.loadSettings();
  }

  async isSettingsCacheValid(): Promise<boolean> {
    // Simple cache validation - in a real implementation, this might check timestamps
    return this.settingsCache.size > 0;
  }

  // Import/Export
  async exportSettings(format: SettingsExportFormat, categories?: SettingsCategory[]): Promise<string> {
    try {
      const allSettings = await this.getAllSettings();
      let settingsToExport = allSettings;

      if (categories) {
        settingsToExport = {};
        categories.forEach(category => {
          Object.keys(allSettings).forEach(key => {
            if (key.startsWith(category)) {
              settingsToExport[key] = allSettings[key];
            }
          });
        });
      }

      switch (format) {
        case SettingsExportFormat.JSON:
          return JSON.stringify(settingsToExport, null, 2);
        case SettingsExportFormat.CSV:
          return this.convertSettingsToCSV(settingsToExport);
        default:
          throw new SettingsError(
            SettingsErrorType.INVALID_VALUE,
            `Unsupported export format: ${format}`,
            'UNSUPPORTED_EXPORT_FORMAT'
          );
      }
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to export settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SETTINGS_EXPORT_FAILED'
      );
    }
  }

  async importSettings(data: string, format?: SettingsExportFormat): Promise<SettingsImportResult> {
    const result: SettingsImportResult = {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      importedCategories: [],
    };

    try {
      let settingsToImport: Record<string, any>;

      // Parse the data based on format
      const detectedFormat = format || this.detectImportFormat(data);
      switch (detectedFormat) {
        case SettingsExportFormat.JSON:
          settingsToImport = JSON.parse(data);
          break;
        default:
          throw new SettingsError(
            SettingsErrorType.INVALID_VALUE,
            `Unsupported import format: ${detectedFormat}`,
            'UNSUPPORTED_IMPORT_FORMAT'
          );
      }

      // Import each setting
      for (const [key, value] of Object.entries(settingsToImport)) {
        try {
          const [category, settingKey] = this.parseStorageKey(key);
          if (category && settingKey) {
            const isValid = await this.checkSettingConstraints(category, settingKey, value);
            if (isValid) {
              await this.setSetting(category, settingKey, value);
              result.importedCount++;
              
              if (!result.importedCategories.includes(category)) {
                result.importedCategories.push(category);
              }
            } else {
              result.skippedCount++;
              result.warnings.push(`Skipped invalid setting: ${key}`);
            }
          } else {
            result.skippedCount++;
            result.warnings.push(`Skipped unknown setting: ${key}`);
          }
        } catch (error) {
          result.errorCount++;
          result.errors.push(`Failed to import ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errorCount === 0;
      return result;
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  async backupSettings(description?: string): Promise<SettingsBackup> {
    try {
      const allSettings = await this.getAllSettings();
      const backup: SettingsBackup = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        version: AsyncStorageSettings.SETTINGS_VERSION,
        deviceInfo: 'Android Device', // Simplified
        settings: allSettings,
        checksum: this.calculateChecksum(JSON.stringify(allSettings)),
        isAutomatic: !description,
        ...(description && { description }),
      };

      // Store the backup
      await AsyncStorage.setItem(
        this.getStorageKey('backups', backup.id),
        JSON.stringify(backup)
      );

      return backup;
    } catch (error) {
      throw new SettingsError(
        SettingsErrorType.STORAGE_ERROR,
        `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BACKUP_CREATION_FAILED'
      );
    }
  }

  async restoreSettings(backupId: string): Promise<SettingsRestoreResult> {
    const result: SettingsRestoreResult = {
      success: false,
      restoredCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      warnings: [],
      backupInfo: {
        timestamp: new Date(),
        version: '0.0.0',
        deviceInfo: 'Unknown',
      },
    };

    try {
      const backupData = await AsyncStorage.getItem(this.getStorageKey('backups', backupId));
      if (!backupData) {
        throw new SettingsError(
          SettingsErrorType.INVALID_KEY,
          'Backup not found',
          'BACKUP_NOT_FOUND'
        );
      }

      const backup: SettingsBackup = JSON.parse(backupData);
      result.backupInfo = {
        timestamp: backup.timestamp,
        version: backup.version,
        deviceInfo: backup.deviceInfo,
      };

      // Verify checksum
      const expectedChecksum = this.calculateChecksum(JSON.stringify(backup.settings));
      if (expectedChecksum !== backup.checksum) {
        result.warnings.push('Backup checksum mismatch - data may be corrupted');
      }

      // Restore each setting
      for (const [key, value] of Object.entries(backup.settings)) {
        try {
          const [category, settingKey] = this.parseStorageKey(key);
          if (category && settingKey) {
            await this.setSetting(category, settingKey, value);
            result.restoredCount++;
          } else {
            result.skippedCount++;
            result.warnings.push(`Skipped unknown setting: ${key}`);
          }
        } catch (error) {
          result.errorCount++;
          result.errors.push(`Failed to restore ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errorCount === 0;
      return result;
    } catch (error) {
      result.errors.push(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Settings observation
  async subscribeToChanges(categories: SettingsCategory[], callback: (event: SettingsChangeEvent) => void): Promise<string> {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.changeSubscriptions.set(subscriptionId, { categories, callback });
    return subscriptionId;
  }

  async unsubscribeFromChanges(subscriptionId: string): Promise<boolean> {
    return this.changeSubscriptions.delete(subscriptionId);
  }

  notifySettingChanged(event: SettingsChangeEvent): void {
    this.changeSubscriptions.forEach(({ categories, callback }) => {
      if (categories.includes(event.category)) {
        try {
          callback(event);
        } catch (error) {
          console.warn('Settings change callback error:', error);
        }
      }
    });
  }

  // Migration and versioning
  async migrateSettings(fromVersion: string, settings: Record<string, any>): Promise<Record<string, any>> {
    // Simplified migration - in a real implementation, this would handle version-specific migrations
    return settings;
  }

  async getSettingsVersion(): Promise<string> {
    return AsyncStorageSettings.SETTINGS_VERSION;
  }

  async upgradeSettings(targetVersion?: string): Promise<boolean> {
    // Simplified upgrade - in a real implementation, this would handle version upgrades
    return true;
  }

  // Utilities
  async isFirstLaunch(): Promise<boolean> {
    const firstLaunchKey = this.getStorageKey(SettingsCategory.APP, 'firstLaunch');
    const value = await AsyncStorage.getItem(firstLaunchKey);
    return value === null || JSON.parse(value) === true;
  }

  async getDefaultSettings(category: SettingsCategory): Promise<Record<string, SettingValue>> {
    return this.defaultSettings.get(category) || {};
  }

  mergeSettings(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
    return { ...base, ...override };
  }

  compareSettings(settings1: Record<string, any>, settings2: Record<string, any>): Array<{
    key: string;
    category: SettingsCategory;
    value1: SettingValue;
    value2: SettingValue;
    isDifferent: boolean;
  }> {
    const allKeys = new Set([...Object.keys(settings1), ...Object.keys(settings2)]);
    const comparisons: Array<{
      key: string;
      category: SettingsCategory;
      value1: SettingValue;
      value2: SettingValue;
      isDifferent: boolean;
    }> = [];

    allKeys.forEach(key => {
      const [category, settingKey] = this.parseStorageKey(key);
      if (category && settingKey) {
        const value1 = settings1[key];
        const value2 = settings2[key];
        const isDifferent = JSON.stringify(value1) !== JSON.stringify(value2);

        comparisons.push({
          key: settingKey,
          category,
          value1,
          value2,
          isDifferent,
        });
      }
    });

    return comparisons;
  }

  // Private helper methods
  private getStorageKey(category: string, key: string): string {
    return `${AsyncStorageSettings.STORAGE_PREFIX}${category}:${key}`;
  }

  private parseStorageKey(fullKey: string): [SettingsCategory | null, string | null] {
    const key = fullKey.replace(AsyncStorageSettings.STORAGE_PREFIX, '');
    const [category, settingKey] = key.split(':');
    
    if (category && Object.values(SettingsCategory).includes(category as SettingsCategory)) {
      return [category as SettingsCategory, settingKey || null];
    }
    
    return [null, null];
  }

  private getDefaultValue(category: SettingsCategory, key: string): SettingValue {
    const categoryDefaults = this.defaultSettings.get(category);
    return categoryDefaults?.[key] || null;
  }

  private async getCategorySettings(category: SettingsCategory): Promise<Record<string, any>> {
    const defaults = this.defaultSettings.get(category) || {};
    const settings: Record<string, any> = { ...defaults };

    for (const key of Object.keys(defaults)) {
      const value = await this.getSetting(category, key);
      if (value !== null) {
        settings[key] = value;
      }
    }

    return settings;
  }

  private async updateCategorySettings(category: SettingsCategory, updates: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      await this.setSetting(category, key, value);
    }
  }

  private isValidType(value: SettingValue, expectedType: SettingType): boolean {
    switch (expectedType) {
      case SettingType.STRING:
        return typeof value === 'string';
      case SettingType.NUMBER:
        return typeof value === 'number';
      case SettingType.BOOLEAN:
        return typeof value === 'boolean';
      case SettingType.ARRAY:
        return Array.isArray(value);
      case SettingType.OBJECT:
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case SettingType.DATE:
        return value instanceof Date || typeof value === 'string';
      default:
        return true;
    }
  }

  private convertSettingsToCSV(settings: Record<string, any>): string {
    const headers = ['Category', 'Key', 'Value', 'Type'];
    const rows = [headers.join(',')];

    Object.entries(settings).forEach(([fullKey, value]) => {
      const [category, key] = this.parseStorageKey(fullKey);
      if (category && key) {
        const csvRow = [
          category,
          key,
          JSON.stringify(value),
          typeof value,
        ].map(field => `"${field}"`).join(',');
        rows.push(csvRow);
      }
    });

    return rows.join('\n');
  }

  private detectImportFormat(data: string): SettingsExportFormat {
    try {
      JSON.parse(data);
      return SettingsExportFormat.JSON;
    } catch {
      // Could add CSV detection here
      return SettingsExportFormat.JSON;
    }
  }

  private calculateChecksum(data: string): string {
    // Simple checksum - in a real implementation, use a proper hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private initializeDefaultSettings(): void {
    // App settings defaults
    this.defaultSettings.set(SettingsCategory.APP, {
      version: '1.0.0',
      language: 'en',
      theme: 'auto',
      autoSave: true,
      crashReporting: true,
      analytics: false,
      firstLaunch: true,
      lastUsed: new Date(),
      totalConversions: 0,
      appRating: null,
      reviewPromptShown: false,
    });

    // User preferences defaults
    this.defaultSettings.set(SettingsCategory.USER_PREFERENCES, {
      defaultQuality: QualityPreset.MEDIUM,
      outputFormat: 'mp4',
      preferHardwareEncoding: true,
      autoStartConversion: false,
      showProgressNotifications: true,
      vibrationFeedback: true,
      soundEffects: true,
      keepScreenOn: false,
      lowPowerMode: false,
      customOutputPath: null,
      autoDeleteOriginals: false,
      backupSettings: true,
    });

    // Video settings defaults
    this.defaultSettings.set(SettingsCategory.VIDEO, {
      defaultCodec: 'h264',
      quality: QualityPreset.MEDIUM,
      resolution: {
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
      },
      framerate: 30,
      keyframeInterval: 250,
      bFrames: 2,
      enableHardwareAcceleration: true,
      hardwareEncoder: null,
      enableGpuFiltering: false,
      maxFileSize: null,
      twoPassEncoding: false,
      interlaceMode: 'progressive',
    });

    // Audio settings defaults
    this.defaultSettings.set(SettingsCategory.AUDIO, {
      codec: 'aac',
      bitrate: 128,
      sampleRate: 44100,
      channels: 2,
      volume: 100,
      normalization: false,
      noiseReduction: false,
      compressor: false,
      enablePassthrough: false,
    });

    // Storage settings defaults
    this.defaultSettings.set(SettingsCategory.STORAGE, {
      defaultOutputPath: '/storage/emulated/0/VideoConverter',
      tempDirectory: '/data/data/com.videoconverter/cache',
      maxTempSize: 1024 * 1024 * 1024, // 1GB
      autoCleanupTemp: true,
      compressionLevel: 6,
      reserveStorageSpace: 100 * 1024 * 1024, // 100MB
      moveToSdCard: false,
      createDateFolders: false,
    });

    // Device settings defaults
    this.defaultSettings.set(SettingsCategory.DEVICE, {
      enableBackgroundProcessing: true,
      thermalThrottling: true,
      batteryOptimization: true,
      networkUsage: 'wifi_only',
      cpuCoreLimit: null,
      memoryLimit: null,
      priorityMode: 'normal',
    });

    // Security settings defaults
    this.defaultSettings.set(SettingsCategory.SECURITY, {
      requireAuthentication: false,
      authenticationMethod: 'biometric',
      autoLockTimeout: 300, // 5 minutes
      encryptFiles: false,
      allowScreenshots: true,
      hideInRecents: false,
      secureKeystore: false,
    });

    // Accessibility settings defaults
    this.defaultSettings.set(SettingsCategory.ACCESSIBILITY, {
      increasedTextSize: false,
      highContrast: false,
      reduceMotion: false,
      voiceAnnouncements: false,
      hapticFeedback: true,
      simplifiedInterface: false,
      colorBlindMode: null,
    });

    // Experimental settings defaults
    this.defaultSettings.set(SettingsCategory.EXPERIMENTAL, {
      enableBetaFeatures: false,
      newEncodingEngine: false,
      advancedFilters: false,
      mlUpscaling: false,
      previewGeneration: false,
      batchProcessing: false,
      cloudSync: false,
      telemetryLevel: 'basic',
    });
  }

  private getAppSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'version',
        type: SettingType.STRING,
        defaultValue: '1.0.0',
        description: 'App version',
        category: SettingsCategory.APP,
        isVisible: false,
        isEditable: false,
        requiresRestart: false,
        isExperimental: false,
      },
      {
        key: 'language',
        type: SettingType.STRING,
        defaultValue: 'en',
        description: 'App language',
        category: SettingsCategory.APP,
        constraints: {
          allowedValues: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja'],
        },
        isVisible: true,
        isEditable: true,
        requiresRestart: true,
        isExperimental: false,
      },
      {
        key: 'theme',
        type: SettingType.STRING,
        defaultValue: 'auto',
        description: 'App theme',
        category: SettingsCategory.APP,
        constraints: {
          allowedValues: ['light', 'dark', 'auto'],
        },
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getUserPreferencesDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'defaultQuality',
        type: SettingType.STRING,
        defaultValue: QualityPreset.MEDIUM,
        description: 'Default video quality preset',
        category: SettingsCategory.USER_PREFERENCES,
        constraints: {
          allowedValues: Object.values(QualityPreset),
        },
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getVideoSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'defaultCodec',
        type: SettingType.STRING,
        defaultValue: 'h264',
        description: 'Default video codec',
        category: SettingsCategory.VIDEO,
        constraints: {
          allowedValues: ['h264', 'h265', 'vp8', 'vp9'],
        },
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getAudioSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'codec',
        type: SettingType.STRING,
        defaultValue: 'aac',
        description: 'Audio codec',
        category: SettingsCategory.AUDIO,
        constraints: {
          allowedValues: ['aac', 'mp3', 'opus', 'flac'],
        },
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getStorageSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'defaultOutputPath',
        type: SettingType.STRING,
        defaultValue: '/storage/emulated/0/VideoConverter',
        description: 'Default output directory',
        category: SettingsCategory.STORAGE,
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getDeviceSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'enableBackgroundProcessing',
        type: SettingType.BOOLEAN,
        defaultValue: true,
        description: 'Enable background processing',
        category: SettingsCategory.DEVICE,
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getSecuritySettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'requireAuthentication',
        type: SettingType.BOOLEAN,
        defaultValue: false,
        description: 'Require authentication to access app',
        category: SettingsCategory.SECURITY,
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getAccessibilitySettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'increasedTextSize',
        type: SettingType.BOOLEAN,
        defaultValue: false,
        description: 'Use larger text size',
        category: SettingsCategory.ACCESSIBILITY,
        isVisible: true,
        isEditable: true,
        requiresRestart: false,
        isExperimental: false,
      },
    ];
  }

  private getExperimentalSettingsDefinitions(): SettingDefinition[] {
    return [
      {
        key: 'enableBetaFeatures',
        type: SettingType.BOOLEAN,
        defaultValue: false,
        description: 'Enable experimental beta features',
        category: SettingsCategory.EXPERIMENTAL,
        isVisible: true,
        isEditable: true,
        requiresRestart: true,
        isExperimental: true,
      },
    ];
  }
}