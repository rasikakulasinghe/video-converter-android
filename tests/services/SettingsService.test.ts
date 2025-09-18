import {
  SettingsService,
  AppSettings,
  UserPreferences,
  VideoSettings,
  QualityPreset,
  AudioSettings,
  StorageSettings,
  DeviceSettings,
  SecuritySettings,
  AccessibilitySettings,
  ExperimentalSettings,
  SettingsCategory,
  SettingType,
  SettingValue,
  SettingDefinition,
  SettingsValidationResult,
  SettingsBackup,
  SettingsRestoreResult,
  SettingsExportFormat,
  SettingsImportResult,
  SettingsChangeEvent,
  SettingsChangeType,
  SettingsError,
  SettingsErrorType,
  ConfigurationProfile,
  ProfileType,
  SettingsSchema,
  SettingConstraint,
  SettingsDependency,
} from '../../src/services/SettingsService';

describe('SettingsService Contract', () => {
  let mockSettingsService: SettingsService;
  let mockAppSettings: AppSettings;
  let mockUserPreferences: UserPreferences;

  beforeEach(() => {
    // Mock settings data
    mockAppSettings = {
      version: '1.0.0',
      language: 'en',
      theme: 'auto',
      autoSave: true,
      crashReporting: true,
      analytics: false,
      firstLaunch: false,
      lastUsed: new Date(),
      totalConversions: 0,
      appRating: null,
      reviewPromptShown: false,
    };

    mockUserPreferences = {
      defaultQuality: 'high',
      outputFormat: 'mp4',
      preferHardwareEncoding: true,
      autoStartConversion: false,
      showProgressNotifications: true,
      vibrationFeedback: true,
      soundEffects: false,
      keepScreenOn: true,
      lowPowerMode: false,
      customOutputPath: null,
      autoDeleteOriginals: false,
      backupSettings: true,
    };

    // Create mock implementation
    mockSettingsService = {
      // Core settings operations
      getAllSettings: jest.fn(),
      getSetting: jest.fn(),
      setSetting: jest.fn(),
      deleteSetting: jest.fn(),
      resetSetting: jest.fn(),
      resetAllSettings: jest.fn(),
      
      // Category-specific settings
      getAppSettings: jest.fn(),
      updateAppSettings: jest.fn(),
      getUserPreferences: jest.fn(),
      updateUserPreferences: jest.fn(),
      getVideoSettings: jest.fn(),
      updateVideoSettings: jest.fn(),
      getAudioSettings: jest.fn(),
      updateAudioSettings: jest.fn(),
      getStorageSettings: jest.fn(),
      updateStorageSettings: jest.fn(),
      getDeviceSettings: jest.fn(),
      updateDeviceSettings: jest.fn(),
      getSecuritySettings: jest.fn(),
      updateSecuritySettings: jest.fn(),
      getAccessibilitySettings: jest.fn(),
      updateAccessibilitySettings: jest.fn(),
      getExperimentalSettings: jest.fn(),
      updateExperimentalSettings: jest.fn(),
      
      // Validation and schema
      validateSettings: jest.fn(),
      getSettingsSchema: jest.fn(),
      getSettingDefinition: jest.fn(),
      checkSettingConstraints: jest.fn(),
      
      // Configuration profiles
      getActiveProfile: jest.fn(),
      setActiveProfile: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: jest.fn(),
      deleteProfile: jest.fn(),
      listProfiles: jest.fn(),
      duplicateProfile: jest.fn(),
      
      // Settings persistence
      saveSettings: jest.fn(),
      loadSettings: jest.fn(),
      reloadSettings: jest.fn(),
      isSettingsCacheValid: jest.fn(),
      
      // Import/Export
      exportSettings: jest.fn(),
      importSettings: jest.fn(),
      backupSettings: jest.fn(),
      restoreSettings: jest.fn(),
      
      // Settings observation
      subscribeToChanges: jest.fn(),
      unsubscribeFromChanges: jest.fn(),
      notifySettingChanged: jest.fn(),
      
      // Migration and versioning
      migrateSettings: jest.fn(),
      getSettingsVersion: jest.fn(),
      upgradeSettings: jest.fn(),
      
      // Utilities
      isFirstLaunch: jest.fn(),
      getDefaultSettings: jest.fn(),
      mergeSettings: jest.fn(),
      compareSettings: jest.fn(),
    };
  });

  describe('Interface Definition', () => {
    it('should define SettingsService interface with all required methods', () => {
      expect(mockSettingsService).toHaveProperty('getAllSettings');
      expect(mockSettingsService).toHaveProperty('getSetting');
      expect(mockSettingsService).toHaveProperty('setSetting');
      expect(mockSettingsService).toHaveProperty('getAppSettings');
      expect(mockSettingsService).toHaveProperty('getUserPreferences');
      expect(mockSettingsService).toHaveProperty('getVideoSettings');
      expect(mockSettingsService).toHaveProperty('validateSettings');
      expect(mockSettingsService).toHaveProperty('exportSettings');
      expect(mockSettingsService).toHaveProperty('subscribeToChanges');
      expect(mockSettingsService).toHaveProperty('migrateSettings');
    });

    it('should define AppSettings interface', () => {
      expect(mockAppSettings).toHaveProperty('version');
      expect(mockAppSettings).toHaveProperty('language');
      expect(mockAppSettings).toHaveProperty('theme');
      expect(mockAppSettings).toHaveProperty('autoSave');
      expect(mockAppSettings).toHaveProperty('totalConversions');
    });

    it('should define UserPreferences interface', () => {
      expect(mockUserPreferences).toHaveProperty('defaultQuality');
      expect(mockUserPreferences).toHaveProperty('outputFormat');
      expect(mockUserPreferences).toHaveProperty('preferHardwareEncoding');
      expect(mockUserPreferences).toHaveProperty('showProgressNotifications');
      expect(mockUserPreferences).toHaveProperty('keepScreenOn');
    });

    it('should define SettingsCategory enum', () => {
      expect(SettingsCategory.APP).toBe('app');
      expect(SettingsCategory.USER_PREFERENCES).toBe('user_preferences');
      expect(SettingsCategory.VIDEO).toBe('video');
      expect(SettingsCategory.AUDIO).toBe('audio');
      expect(SettingsCategory.STORAGE).toBe('storage');
      expect(SettingsCategory.DEVICE).toBe('device');
      expect(SettingsCategory.SECURITY).toBe('security');
      expect(SettingsCategory.ACCESSIBILITY).toBe('accessibility');
      expect(SettingsCategory.EXPERIMENTAL).toBe('experimental');
    });

    it('should define SettingType enum', () => {
      expect(SettingType.STRING).toBe('string');
      expect(SettingType.NUMBER).toBe('number');
      expect(SettingType.BOOLEAN).toBe('boolean');
      expect(SettingType.ARRAY).toBe('array');
      expect(SettingType.OBJECT).toBe('object');
      expect(SettingType.ENUM).toBe('enum');
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings organized by category', async () => {
      const mockAllSettings = {
        app: mockAppSettings,
        userPreferences: mockUserPreferences,
        video: {
          defaultCodec: 'h264',
          quality: 'high',
          bitrate: 8000000,
          framerate: 30,
          resolution: '1920x1080',
        },
        audio: {
          codec: 'aac',
          bitrate: 128000,
          sampleRate: 44100,
          channels: 2,
        },
      };

      (mockSettingsService.getAllSettings as jest.Mock).mockResolvedValue(mockAllSettings);

      const allSettings = await mockSettingsService.getAllSettings();
      
      expect(allSettings.app).toEqual(mockAppSettings);
      expect(allSettings.userPreferences).toEqual(mockUserPreferences);
      expect(allSettings.video).toHaveProperty('defaultCodec');
      expect(allSettings.audio).toHaveProperty('codec');
    });

    it('should handle empty settings gracefully', async () => {
      (mockSettingsService.getAllSettings as jest.Mock).mockResolvedValue({});

      const allSettings = await mockSettingsService.getAllSettings();
      
      expect(allSettings).toEqual({});
    });
  });

  describe('getSetting', () => {
    it('should retrieve specific setting by key and category', async () => {
      (mockSettingsService.getSetting as jest.Mock).mockResolvedValue('high');

      const setting = await mockSettingsService.getSetting(SettingsCategory.USER_PREFERENCES, 'defaultQuality');
      
      expect(setting).toBe('high');
      expect(mockSettingsService.getSetting).toHaveBeenCalledWith(SettingsCategory.USER_PREFERENCES, 'defaultQuality');
    });

    it('should return null for non-existent setting', async () => {
      (mockSettingsService.getSetting as jest.Mock).mockResolvedValue(null);

      const setting = await mockSettingsService.getSetting(SettingsCategory.APP, 'nonExistentKey');
      
      expect(setting).toBeNull();
    });

    it('should handle nested setting keys', async () => {
      (mockSettingsService.getSetting as jest.Mock).mockResolvedValue(1920);

      const setting = await mockSettingsService.getSetting(SettingsCategory.VIDEO, 'resolution.width');
      
      expect(setting).toBe(1920);
    });
  });

  describe('setSetting', () => {
    it('should set setting value with validation', async () => {
      (mockSettingsService.setSetting as jest.Mock).mockResolvedValue(true);

      const success = await mockSettingsService.setSetting(
        SettingsCategory.USER_PREFERENCES,
        'defaultQuality',
        'ultra'
      );
      
      expect(success).toBe(true);
      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(
        SettingsCategory.USER_PREFERENCES,
        'defaultQuality',
        'ultra'
      );
    });

    it('should handle validation failures', async () => {
      const validationError = new SettingsError(
        SettingsErrorType.VALIDATION_FAILED,
        'Invalid quality setting: "invalid" is not a valid option',
        'INVALID_QUALITY_SETTING'
      );

      (mockSettingsService.setSetting as jest.Mock).mockRejectedValue(validationError);

      await expect(mockSettingsService.setSetting(
        SettingsCategory.USER_PREFERENCES,
        'defaultQuality',
        'invalid'
      )).rejects.toThrow('Invalid quality setting: "invalid" is not a valid option');
    });

    it('should trigger change notifications', async () => {
      const changeEvent: SettingsChangeEvent = {
        category: SettingsCategory.USER_PREFERENCES,
        key: 'defaultQuality',
        oldValue: 'high',
        newValue: 'ultra',
        changeType: SettingsChangeType.UPDATE,
        timestamp: new Date(),
      };

      (mockSettingsService.setSetting as jest.Mock).mockImplementation(async () => {
        // Simulate change notification
        if (mockSettingsService.notifySettingChanged) {
          mockSettingsService.notifySettingChanged(changeEvent);
        }
        return true;
      });

      await mockSettingsService.setSetting(
        SettingsCategory.USER_PREFERENCES,
        'defaultQuality',
        'ultra'
      );
      
      expect(mockSettingsService.notifySettingChanged).toHaveBeenCalledWith(changeEvent);
    });
  });

  describe('getAppSettings', () => {
    it('should return complete app settings', async () => {
      (mockSettingsService.getAppSettings as jest.Mock).mockResolvedValue(mockAppSettings);

      const appSettings = await mockSettingsService.getAppSettings();
      
      expect(appSettings.version).toBe('1.0.0');
      expect(appSettings.language).toBe('en');
      expect(appSettings.theme).toBe('auto');
      expect(appSettings.autoSave).toBe(true);
      expect(appSettings.totalConversions).toBe(0);
    });

    it('should include computed settings properties', async () => {
      const settingsWithComputed: AppSettings = {
        ...mockAppSettings,
        isFirstLaunch: true,
        daysSinceInstall: 5,
        conversionRate: 0.85,
      };

      (mockSettingsService.getAppSettings as jest.Mock).mockResolvedValue(settingsWithComputed);

      const appSettings = await mockSettingsService.getAppSettings();
      
      expect(appSettings.isFirstLaunch).toBe(true);
      expect(appSettings.daysSinceInstall).toBe(5);
      expect(appSettings.conversionRate).toBe(0.85);
    });
  });

  describe('updateAppSettings', () => {
    it('should update app settings partially', async () => {
      const updates = {
        language: 'es',
        theme: 'dark',
        totalConversions: 5,
      };

      const updatedSettings: AppSettings = {
        ...mockAppSettings,
        ...updates,
      };

      (mockSettingsService.updateAppSettings as jest.Mock).mockResolvedValue(updatedSettings);

      const result = await mockSettingsService.updateAppSettings(updates);
      
      expect(result.language).toBe('es');
      expect(result.theme).toBe('dark');
      expect(result.totalConversions).toBe(5);
      expect(result.version).toBe('1.0.0'); // unchanged
    });

    it('should validate updates before applying', async () => {
      const invalidUpdates = {
        totalConversions: -1,
        theme: 'invalid_theme',
      };

      const validationError = new SettingsError(
        SettingsErrorType.VALIDATION_FAILED,
        'Invalid settings: totalConversions cannot be negative',
        'INVALID_TOTAL_CONVERSIONS'
      );

      (mockSettingsService.updateAppSettings as jest.Mock).mockRejectedValue(validationError);

      await expect(mockSettingsService.updateAppSettings(invalidUpdates))
        .rejects.toThrow('Invalid settings: totalConversions cannot be negative');
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences with defaults', async () => {
      (mockSettingsService.getUserPreferences as jest.Mock).mockResolvedValue(mockUserPreferences);

      const preferences = await mockSettingsService.getUserPreferences();
      
      expect(preferences.defaultQuality).toBe('high');
      expect(preferences.outputFormat).toBe('mp4');
      expect(preferences.preferHardwareEncoding).toBe(true);
      expect(preferences.showProgressNotifications).toBe(true);
      expect(preferences.autoDeleteOriginals).toBe(false);
    });

    it('should merge with device-specific defaults', async () => {
      const deviceSpecificPreferences: UserPreferences = {
        ...mockUserPreferences,
        preferHardwareEncoding: false, // Device doesn't support hardware encoding
        lowPowerMode: true, // Device is low on battery
        keepScreenOn: false, // Save battery
      };

      (mockSettingsService.getUserPreferences as jest.Mock).mockResolvedValue(deviceSpecificPreferences);

      const preferences = await mockSettingsService.getUserPreferences();
      
      expect(preferences.preferHardwareEncoding).toBe(false);
      expect(preferences.lowPowerMode).toBe(true);
      expect(preferences.keepScreenOn).toBe(false);
    });
  });

  describe('getVideoSettings', () => {
    it('should return comprehensive video settings', async () => {
      const videoSettings: VideoSettings = {
        defaultCodec: 'h264',
        fallbackCodec: 'h265',
        quality: QualityPreset.HIGH,
        customQuality: {
          bitrate: 8000000,
          crf: 23,
          preset: 'medium',
        },
        resolution: {
          width: 1920,
          height: 1080,
          aspectRatio: '16:9',
        },
        framerate: 30,
        keyframeInterval: 2,
        bFrames: 2,
        enableHardwareAcceleration: true,
        hardwareEncoder: 'mediacodec',
        enableGpuFiltering: false,
        maxFileSize: null,
        twoPassEncoding: false,
        interlaceMode: 'progressive',
      };

      (mockSettingsService.getVideoSettings as jest.Mock).mockResolvedValue(videoSettings);

      const settings = await mockSettingsService.getVideoSettings();
      
      expect(settings.defaultCodec).toBe('h264');
      expect(settings.quality).toBe(QualityPreset.HIGH);
      expect(settings.resolution.width).toBe(1920);
      expect(settings.enableHardwareAcceleration).toBe(true);
    });

    it('should handle codec compatibility', async () => {
      const compatibilitySettings: VideoSettings = {
        defaultCodec: 'h265',
        fallbackCodec: 'h264',
        quality: QualityPreset.MEDIUM,
        enableHardwareAcceleration: false, // Fallback for older devices
        hardwareEncoder: null,
        twoPassEncoding: true, // Better quality for software encoding
        customQuality: {
          bitrate: 4000000,
          crf: 28,
          preset: 'slow',
        },
        resolution: {
          width: 1280,
          height: 720,
          aspectRatio: '16:9',
        },
        framerate: 24,
        keyframeInterval: 2,
        bFrames: 0,
        enableGpuFiltering: false,
        maxFileSize: 1073741824, // 1GB
        interlaceMode: 'progressive',
      };

      (mockSettingsService.getVideoSettings as jest.Mock).mockResolvedValue(compatibilitySettings);

      const settings = await mockSettingsService.getVideoSettings();
      
      expect(settings.defaultCodec).toBe('h265');
      expect(settings.fallbackCodec).toBe('h264');
      expect(settings.enableHardwareAcceleration).toBe(false);
      expect(settings.twoPassEncoding).toBe(true);
    });
  });

  describe('validateSettings', () => {
    it('should validate settings against schema', async () => {
      const settingsToValidate = {
        defaultQuality: 'high',
        outputFormat: 'mp4',
        bitrate: 8000000,
      };

      const validationResult: SettingsValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        validatedSettings: settingsToValidate,
      };

      (mockSettingsService.validateSettings as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockSettingsService.validateSettings(
        SettingsCategory.VIDEO,
        settingsToValidate
      );
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validatedSettings).toEqual(settingsToValidate);
    });

    it('should detect validation errors', async () => {
      const invalidSettings = {
        defaultQuality: 'invalid',
        bitrate: -1000,
        outputFormat: 'unsupported_format',
      };

      const validationResult: SettingsValidationResult = {
        isValid: false,
        errors: [
          'defaultQuality: "invalid" is not a valid quality option',
          'bitrate: must be a positive number',
          'outputFormat: "unsupported_format" is not supported',
        ],
        warnings: [
          'bitrate: Consider using standard bitrate values for better compatibility',
        ],
        validatedSettings: null,
      };

      (mockSettingsService.validateSettings as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockSettingsService.validateSettings(
        SettingsCategory.VIDEO,
        invalidSettings
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.warnings).toHaveLength(1);
      expect(result.validatedSettings).toBeNull();
    });

    it('should handle cross-setting dependencies', async () => {
      const settingsWithDependencies = {
        enableHardwareAcceleration: true,
        hardwareEncoder: null, // Missing required dependency
        codec: 'h265',
      };

      const validationResult: SettingsValidationResult = {
        isValid: false,
        errors: [
          'hardwareEncoder: required when enableHardwareAcceleration is true',
        ],
        warnings: [
          'codec: h265 may not be supported by all hardware encoders',
        ],
        validatedSettings: null,
      };

      (mockSettingsService.validateSettings as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockSettingsService.validateSettings(
        SettingsCategory.VIDEO,
        settingsWithDependencies
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('hardwareEncoder: required');
      expect(result.warnings[0]).toContain('h265 may not be supported');
    });
  });

  describe('exportSettings', () => {
    it('should export settings in JSON format', async () => {
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: {
          app: mockAppSettings,
          userPreferences: mockUserPreferences,
        },
        metadata: {
          deviceInfo: 'Samsung Galaxy S21',
          appVersion: '1.0.0',
          exportReason: 'backup',
        },
      };

      (mockSettingsService.exportSettings as jest.Mock).mockResolvedValue(JSON.stringify(exportData, null, 2));

      const result = await mockSettingsService.exportSettings(SettingsExportFormat.JSON);
      
      const parsed = JSON.parse(result);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.settings.app.version).toBe(mockAppSettings.version);
      expect(parsed.settings.app.language).toBe(mockAppSettings.language);
      expect(parsed.settings.app.theme).toBe(mockAppSettings.theme);
      expect(parsed.metadata.deviceInfo).toBe('Samsung Galaxy S21');
    });

    it('should export settings with selective categories', async () => {
      const partialExport = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: {
          userPreferences: mockUserPreferences,
        },
        categories: [SettingsCategory.USER_PREFERENCES],
      };

      (mockSettingsService.exportSettings as jest.Mock).mockResolvedValue(JSON.stringify(partialExport));

      const result = await mockSettingsService.exportSettings(
        SettingsExportFormat.JSON,
        [SettingsCategory.USER_PREFERENCES]
      );
      
      const parsed = JSON.parse(result);
      expect(parsed.settings).toHaveProperty('userPreferences');
      expect(parsed.settings).not.toHaveProperty('app');
      expect(parsed.categories).toContain(SettingsCategory.USER_PREFERENCES);
    });
  });

  describe('importSettings', () => {
    it('should import and validate settings', async () => {
      const importData = JSON.stringify({
        version: '1.0.0',
        settings: {
          userPreferences: {
            defaultQuality: 'ultra',
            outputFormat: 'mp4',
            preferHardwareEncoding: true,
          },
        },
      });

      const importResult: SettingsImportResult = {
        success: true,
        importedCount: 3,
        skippedCount: 0,
        errorCount: 0,
        errors: [],
        warnings: [],
        importedCategories: [SettingsCategory.USER_PREFERENCES],
      };

      (mockSettingsService.importSettings as jest.Mock).mockResolvedValue(importResult);

      const result = await mockSettingsService.importSettings(importData);
      
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.importedCategories).toContain(SettingsCategory.USER_PREFERENCES);
    });

    it('should handle import validation errors', async () => {
      const invalidImportData = JSON.stringify({
        version: '0.5.0', // Old version
        settings: {
          video: {
            codec: 'unsupported_codec',
            bitrate: 'invalid_bitrate',
          },
        },
      });

      const importResult: SettingsImportResult = {
        success: false,
        importedCount: 0,
        skippedCount: 2,
        errorCount: 2,
        errors: [
          'codec: "unsupported_codec" is not supported in this version',
          'bitrate: must be a number, got string',
        ],
        warnings: [
          'Settings version 0.5.0 is older than current version 1.0.0',
        ],
        importedCategories: [],
      };

      (mockSettingsService.importSettings as jest.Mock).mockResolvedValue(importResult);

      const result = await mockSettingsService.importSettings(invalidImportData);
      
      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(2);
      expect(result.errors).toContain('codec: "unsupported_codec" is not supported in this version');
      expect(result.warnings[0]).toContain('Settings version 0.5.0 is older');
    });
  });

  describe('Configuration Profiles', () => {
    it('should create and manage configuration profiles', async () => {
      const customProfile: ConfigurationProfile = {
        id: 'profile-001',
        name: 'High Quality Video',
        description: 'Optimized for high-quality video conversion',
        type: ProfileType.CUSTOM,
        isActive: false,
        isDefault: false,
        createdAt: new Date(),
        lastModified: new Date(),
        settings: {
          video: {
            quality: QualityPreset.ULTRA,
            enableHardwareAcceleration: true,
            twoPassEncoding: true,
          },
          userPreferences: {
            keepScreenOn: true,
            showProgressNotifications: true,
          },
        },
        metadata: {
          creator: 'user',
          deviceOptimized: false,
          tags: ['high-quality', 'two-pass'],
        },
      };

      (mockSettingsService.createProfile as jest.Mock).mockResolvedValue(customProfile);

      const result = await mockSettingsService.createProfile(
        'High Quality Video',
        'Optimized for high-quality video conversion',
        customProfile.settings
      );
      
      expect(result.name).toBe('High Quality Video');
      expect(result.type).toBe(ProfileType.CUSTOM);
      expect(result.settings.video.quality).toBe(QualityPreset.ULTRA);
      expect(result.metadata?.tags).toContain('high-quality');
    });

    it('should switch between profiles', async () => {
      const profile: ConfigurationProfile = {
        id: 'battery-saver',
        name: 'Battery Saver',
        description: 'Optimized for battery life',
        type: ProfileType.SYSTEM,
        isActive: true,
        isDefault: false,
        createdAt: new Date(),
        lastModified: new Date(),
        settings: {
          video: {
            quality: QualityPreset.MEDIUM,
            enableHardwareAcceleration: true,
          },
          userPreferences: {
            lowPowerMode: true,
            keepScreenOn: false,
          },
        },
      };

      (mockSettingsService.setActiveProfile as jest.Mock).mockResolvedValue(profile);

      const result = await mockSettingsService.setActiveProfile('battery-saver');
      
      expect(result.isActive).toBe(true);
      expect(result.settings.userPreferences.lowPowerMode).toBe(true);
      expect(result.settings.userPreferences.keepScreenOn).toBe(false);
    });
  });

  describe('Settings Change Observation', () => {
    it('should subscribe to settings changes', async () => {
      const subscriptionId = 'subscription-001';
      const changeCallback = jest.fn();

      (mockSettingsService.subscribeToChanges as jest.Mock).mockResolvedValue(subscriptionId);

      const result = await mockSettingsService.subscribeToChanges(
        [SettingsCategory.USER_PREFERENCES, SettingsCategory.VIDEO],
        changeCallback
      );
      
      expect(result).toBe(subscriptionId);
      expect(mockSettingsService.subscribeToChanges).toHaveBeenCalledWith(
        [SettingsCategory.USER_PREFERENCES, SettingsCategory.VIDEO],
        changeCallback
      );
    });

    it('should handle settings change events', async () => {
      const changeCallback = jest.fn();
      const changeEvent: SettingsChangeEvent = {
        category: SettingsCategory.USER_PREFERENCES,
        key: 'defaultQuality',
        oldValue: 'high',
        newValue: 'ultra',
        changeType: SettingsChangeType.UPDATE,
        timestamp: new Date(),
      };

      (mockSettingsService.subscribeToChanges as jest.Mock).mockImplementation(async (categories, callback) => {
        // Simulate change event
        callback(changeEvent);
        return 'subscription-001';
      });

      await mockSettingsService.subscribeToChanges(
        [SettingsCategory.USER_PREFERENCES],
        changeCallback
      );
      
      expect(changeCallback).toHaveBeenCalledWith(changeEvent);
    });
  });

  describe('Settings Migration', () => {
    it('should migrate settings from old version', async () => {
      const oldSettings = {
        version: '0.9.0',
        quality: 'good', // Old enum value
        useHardwareEncoder: true, // Old key name
        savePath: '/old/path', // Deprecated setting
      };

      const migratedSettings = {
        version: '1.0.0',
        userPreferences: {
          defaultQuality: 'high', // Migrated enum value
          preferHardwareEncoding: true, // New key name
        },
        storage: {
          customOutputPath: '/new/path', // Moved to different category
        },
        migrationLog: [
          'Migrated quality "good" to "high"',
          'Renamed useHardwareEncoder to preferHardwareEncoding',
          'Moved savePath to storage.customOutputPath',
        ],
      };

      (mockSettingsService.migrateSettings as jest.Mock).mockResolvedValue(migratedSettings);

      const result = await mockSettingsService.migrateSettings('0.9.0', oldSettings);
      
      expect(result.version).toBe('1.0.0');
      expect(result.userPreferences.defaultQuality).toBe('high');
      expect(result.userPreferences.preferHardwareEncoding).toBe(true);
      expect(result.migrationLog).toContain('Migrated quality "good" to "high"');
    });

    it('should handle settings version compatibility', async () => {
      (mockSettingsService.getSettingsVersion as jest.Mock).mockResolvedValue('1.0.0');

      const version = await mockSettingsService.getSettingsVersion();
      
      expect(version).toBe('1.0.0');
    });
  });

  describe('Error Handling', () => {
    it('should define SettingsError class with proper types', () => {
      const error = new SettingsError(
        SettingsErrorType.INVALID_CATEGORY,
        'Unknown settings category: "invalid_category"',
        'UNKNOWN_CATEGORY',
        { category: 'invalid_category' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(SettingsErrorType.INVALID_CATEGORY);
      expect(error.message).toBe('Unknown settings category: "invalid_category"');
      expect(error.code).toBe('UNKNOWN_CATEGORY');
      expect(error.details).toEqual({ category: 'invalid_category' });
    });

    it('should handle different error types', () => {
      const errorTypes = [
        SettingsErrorType.INVALID_CATEGORY,
        SettingsErrorType.INVALID_KEY,
        SettingsErrorType.INVALID_VALUE,
        SettingsErrorType.VALIDATION_FAILED,
        SettingsErrorType.PERMISSION_DENIED,
        SettingsErrorType.STORAGE_ERROR,
        SettingsErrorType.MIGRATION_FAILED,
        SettingsErrorType.SCHEMA_MISMATCH,
        SettingsErrorType.UNKNOWN_ERROR,
      ];

      errorTypes.forEach(type => {
        const error = new SettingsError(type, `Test ${type}`, `TEST_${type}`);
        expect(error.type).toBe(type);
      });
    });
  });
});