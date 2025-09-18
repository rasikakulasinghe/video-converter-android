import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  SettingsService,
  AppSettings,
  UserPreferences,
  VideoSettings,
  AudioSettings,
  StorageSettings,
  DeviceSettings,
  SecuritySettings,
  AccessibilitySettings,
  ExperimentalSettings,
  SettingsCategory,
  SettingsChangeEvent,
  ConfigurationProfile,
  SettingsBackup,
  SettingsExportFormat,
  QualityPreset,
} from '../services/SettingsService';
import { AsyncStorageSettings } from '../services/implementations/AsyncStorageSettings';

/**
 * Settings store state interface
 */
interface SettingsState {
  // Settings data
  appSettings: AppSettings | null;
  userPreferences: UserPreferences | null;
  videoSettings: VideoSettings | null;
  audioSettings: AudioSettings | null;
  storageSettings: StorageSettings | null;
  deviceSettings: DeviceSettings | null;
  securitySettings: SecuritySettings | null;
  accessibilitySettings: AccessibilitySettings | null;
  experimentalSettings: ExperimentalSettings | null;

  // Configuration profiles
  activeProfile: ConfigurationProfile | null;
  availableProfiles: ConfigurationProfile[];

  // UI state
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  hasUnsavedChanges: boolean;

  // Actions
  loadAllSettings: () => Promise<void>;
  
  // App settings actions
  updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  
  // User preferences actions
  updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  setDefaultQuality: (quality: string) => Promise<void>;
  setOutputFormat: (format: string) => Promise<void>;
  toggleAutoStartConversion: () => Promise<void>;
  toggleHardwareEncoding: () => Promise<void>;
  
  // Video settings actions
  updateVideoSettings: (updates: Partial<VideoSettings>) => Promise<void>;
  setVideoQuality: (quality: QualityPreset) => Promise<void>;
  setVideoCodec: (codec: string) => Promise<void>;
  
  // Audio settings actions
  updateAudioSettings: (updates: Partial<AudioSettings>) => Promise<void>;
  setAudioCodec: (codec: string) => Promise<void>;
  setAudioBitrate: (bitrate: number) => Promise<void>;
  
  // Storage settings actions
  updateStorageSettings: (updates: Partial<StorageSettings>) => Promise<void>;
  setOutputPath: (path: string) => Promise<void>;
  
  // Device settings actions
  updateDeviceSettings: (updates: Partial<DeviceSettings>) => Promise<void>;
  toggleBackgroundProcessing: () => Promise<void>;
  
  // Security settings actions
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => Promise<void>;
  
  // Accessibility settings actions
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  
  // Experimental settings actions
  updateExperimentalSettings: (updates: Partial<ExperimentalSettings>) => Promise<void>;
  
  // Configuration profile actions
  loadProfiles: () => Promise<void>;
  setActiveProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string, description: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  
  // Import/Export actions
  exportSettings: (format: SettingsExportFormat, categories?: SettingsCategory[]) => Promise<string>;
  importSettings: (data: string, format?: SettingsExportFormat) => Promise<void>;
  
  // Backup/Restore actions
  createBackup: (description?: string) => Promise<SettingsBackup>;
  restoreBackup: (backupId: string) => Promise<void>;
  
  // Reset actions
  resetCategory: (category: SettingsCategory) => Promise<void>;
  resetAllSettings: () => Promise<void>;
  
  // Utility actions
  saveSettings: () => Promise<void>;
  reloadSettings: () => Promise<void>;
  clearError: () => void;
}

// Default settings values
const defaultAppSettings: AppSettings = {
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
};

const defaultUserPreferences: UserPreferences = {
  defaultQuality: 'medium',
  outputFormat: 'mp4',
  preferHardwareEncoding: true,
  autoStartConversion: false,
  showProgressNotifications: true,
  vibrationFeedback: true,
  soundEffects: true,
  keepScreenOn: true,
  lowPowerMode: false,
  customOutputPath: null,
  autoDeleteOriginals: false,
  backupSettings: true,
};

const defaultVideoSettings: VideoSettings = {
  defaultCodec: 'h264',
  quality: QualityPreset.MEDIUM,
  resolution: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
  },
  framerate: 30,
  keyframeInterval: 2,
  bFrames: 3,
  enableHardwareAcceleration: true,
  hardwareEncoder: null,
  enableGpuFiltering: false,
  maxFileSize: null,
  twoPassEncoding: false,
  interlaceMode: 'progressive',
};

const defaultAudioSettings: AudioSettings = {
  codec: 'aac',
  bitrate: 128,
  sampleRate: 44100,
  channels: 2,
  volume: 1.0,
  normalization: false,
  noiseReduction: false,
  compressor: false,
  enablePassthrough: false,
};

const defaultStorageSettings: StorageSettings = {
  defaultOutputPath: '/storage/emulated/0/VideoConverter',
  tempDirectory: '/storage/emulated/0/VideoConverter/temp',
  maxTempSize: 1000,
  autoCleanupTemp: true,
  compressionLevel: 6,
  reserveStorageSpace: 1000,
  moveToSdCard: false,
  createDateFolders: false,
};

const defaultDeviceSettings: DeviceSettings = {
  enableBackgroundProcessing: true,
  thermalThrottling: true,
  batteryOptimization: true,
  networkUsage: 'wifi_only',
  cpuCoreLimit: null,
  memoryLimit: null,
  priorityMode: 'normal',
};

const defaultSecuritySettings: SecuritySettings = {
  requireAuthentication: false,
  authenticationMethod: 'biometric',
  autoLockTimeout: 300,
  encryptFiles: false,
  allowScreenshots: true,
  hideInRecents: false,
  secureKeystore: false,
};

const defaultAccessibilitySettings: AccessibilitySettings = {
  increasedTextSize: false,
  highContrast: false,
  reduceMotion: false,
  voiceAnnouncements: false,
  hapticFeedback: true,
  simplifiedInterface: false,
  colorBlindMode: null,
};

const defaultExperimentalSettings: ExperimentalSettings = {
  enableBetaFeatures: false,
  newEncodingEngine: false,
  advancedFilters: false,
  mlUpscaling: false,
  previewGeneration: false,
  batchProcessing: false,
  cloudSync: false,
  telemetryLevel: 'basic',
};

// Create service instance
const settingsService: SettingsService = new AsyncStorageSettings();

/**
 * Zustand store for application settings management
 */
export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    appSettings: null,
    userPreferences: null,
    videoSettings: null,
    audioSettings: null,
    storageSettings: null,
    deviceSettings: null,
    securitySettings: null,
    accessibilitySettings: null,
    experimentalSettings: null,
    activeProfile: null,
    availableProfiles: [],
    isLoading: false,
    error: null,
    lastSync: null,
    hasUnsavedChanges: false,

    // Core loading action
    loadAllSettings: async (): Promise<void> => {
      set({ isLoading: true, error: null });
      
      try {
        const [
          appSettings,
          userPreferences,
          videoSettings,
          audioSettings,
          storageSettings,
          deviceSettings,
          securitySettings,
          accessibilitySettings,
          experimentalSettings,
          activeProfile,
        ] = await Promise.all([
          settingsService.getAppSettings(),
          settingsService.getUserPreferences(),
          settingsService.getVideoSettings(),
          settingsService.getAudioSettings(),
          settingsService.getStorageSettings(),
          settingsService.getDeviceSettings(),
          settingsService.getSecuritySettings(),
          settingsService.getAccessibilitySettings(),
          settingsService.getExperimentalSettings(),
          settingsService.getActiveProfile(),
        ]);

        set({
          appSettings,
          userPreferences,
          videoSettings,
          audioSettings,
          storageSettings,
          deviceSettings,
          securitySettings,
          accessibilitySettings,
          experimentalSettings,
          activeProfile,
          lastSync: new Date(),
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to load settings',
          isLoading: false,
        });
      }
    },

    // App settings actions
    updateAppSettings: async (updates: Partial<AppSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateAppSettings(updates);
        set({ 
          appSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update app settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update app settings' });
      }
    },

    setLanguage: async (language: string): Promise<void> => {
      await get().updateAppSettings({ language });
    },

    setTheme: async (theme: string): Promise<void> => {
      await get().updateAppSettings({ theme });
    },

    // User preferences actions
    updateUserPreferences: async (updates: Partial<UserPreferences>): Promise<void> => {
      try {
        const updatedPreferences = await settingsService.updateUserPreferences(updates);
        set({ 
          userPreferences: updatedPreferences,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update user preferences:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update user preferences' });
      }
    },

    setDefaultQuality: async (quality: string): Promise<void> => {
      await get().updateUserPreferences({ defaultQuality: quality });
    },

    setOutputFormat: async (format: string): Promise<void> => {
      await get().updateUserPreferences({ outputFormat: format });
    },

    toggleAutoStartConversion: async (): Promise<void> => {
      const { userPreferences } = get();
      if (userPreferences) {
        await get().updateUserPreferences({ 
          autoStartConversion: !userPreferences.autoStartConversion 
        });
      }
    },

    toggleHardwareEncoding: async (): Promise<void> => {
      const { userPreferences } = get();
      if (userPreferences) {
        await get().updateUserPreferences({ 
          preferHardwareEncoding: !userPreferences.preferHardwareEncoding 
        });
      }
    },

    // Video settings actions
    updateVideoSettings: async (updates: Partial<VideoSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateVideoSettings(updates);
        set({ 
          videoSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update video settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update video settings' });
      }
    },

    setVideoQuality: async (quality: QualityPreset): Promise<void> => {
      await get().updateVideoSettings({ quality });
    },

    setVideoCodec: async (codec: string): Promise<void> => {
      await get().updateVideoSettings({ defaultCodec: codec });
    },

    // Audio settings actions
    updateAudioSettings: async (updates: Partial<AudioSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateAudioSettings(updates);
        set({ 
          audioSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update audio settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update audio settings' });
      }
    },

    setAudioCodec: async (codec: string): Promise<void> => {
      await get().updateAudioSettings({ codec });
    },

    setAudioBitrate: async (bitrate: number): Promise<void> => {
      await get().updateAudioSettings({ bitrate });
    },

    // Storage settings actions
    updateStorageSettings: async (updates: Partial<StorageSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateStorageSettings(updates);
        set({ 
          storageSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update storage settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update storage settings' });
      }
    },

    setOutputPath: async (path: string): Promise<void> => {
      await get().updateStorageSettings({ defaultOutputPath: path });
    },

    // Device settings actions
    updateDeviceSettings: async (updates: Partial<DeviceSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateDeviceSettings(updates);
        set({ 
          deviceSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update device settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update device settings' });
      }
    },

    toggleBackgroundProcessing: async (): Promise<void> => {
      const { deviceSettings } = get();
      if (deviceSettings) {
        await get().updateDeviceSettings({ 
          enableBackgroundProcessing: !deviceSettings.enableBackgroundProcessing 
        });
      }
    },

    // Security settings actions
    updateSecuritySettings: async (updates: Partial<SecuritySettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateSecuritySettings(updates);
        set({ 
          securitySettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update security settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update security settings' });
      }
    },

    // Accessibility settings actions
    updateAccessibilitySettings: async (updates: Partial<AccessibilitySettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateAccessibilitySettings(updates);
        set({ 
          accessibilitySettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update accessibility settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update accessibility settings' });
      }
    },

    // Experimental settings actions
    updateExperimentalSettings: async (updates: Partial<ExperimentalSettings>): Promise<void> => {
      try {
        const updatedSettings = await settingsService.updateExperimentalSettings(updates);
        set({ 
          experimentalSettings: updatedSettings,
          hasUnsavedChanges: true,
          lastSync: new Date(),
        });
      } catch (error) {
        console.error('Failed to update experimental settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update experimental settings' });
      }
    },

    // Configuration profile actions
    loadProfiles: async (): Promise<void> => {
      try {
        const profiles = await settingsService.listProfiles();
        set({ availableProfiles: profiles });
      } catch (error) {
        console.error('Failed to load profiles:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to load profiles' });
      }
    },

    setActiveProfile: async (profileId: string): Promise<void> => {
      try {
        const profile = await settingsService.setActiveProfile(profileId);
        set({ activeProfile: profile });
        // Reload all settings to reflect the new profile
        await get().loadAllSettings();
      } catch (error) {
        console.error('Failed to set active profile:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to set active profile' });
      }
    },

    createProfile: async (name: string, description: string): Promise<void> => {
      try {
        const allSettings = await settingsService.getAllSettings();
        await settingsService.createProfile(name, description, allSettings);
        await get().loadProfiles();
      } catch (error) {
        console.error('Failed to create profile:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to create profile' });
      }
    },

    deleteProfile: async (profileId: string): Promise<void> => {
      try {
        await settingsService.deleteProfile(profileId);
        await get().loadProfiles();
      } catch (error) {
        console.error('Failed to delete profile:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to delete profile' });
      }
    },

    // Import/Export actions
    exportSettings: async (format: SettingsExportFormat, categories?: SettingsCategory[]): Promise<string> => {
      try {
        return await settingsService.exportSettings(format, categories);
      } catch (error) {
        console.error('Failed to export settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to export settings' });
        throw error;
      }
    },

    importSettings: async (data: string, format?: SettingsExportFormat): Promise<void> => {
      try {
        await settingsService.importSettings(data, format);
        await get().loadAllSettings();
      } catch (error) {
        console.error('Failed to import settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to import settings' });
      }
    },

    // Backup/Restore actions
    createBackup: async (description?: string): Promise<SettingsBackup> => {
      try {
        return await settingsService.backupSettings(description);
      } catch (error) {
        console.error('Failed to create backup:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to create backup' });
        throw error;
      }
    },

    restoreBackup: async (backupId: string): Promise<void> => {
      try {
        await settingsService.restoreSettings(backupId);
        await get().loadAllSettings();
      } catch (error) {
        console.error('Failed to restore backup:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to restore backup' });
      }
    },

    // Reset actions
    resetCategory: async (category: SettingsCategory): Promise<void> => {
      try {
        await settingsService.resetAllSettings([category]);
        await get().loadAllSettings();
      } catch (error) {
        console.error('Failed to reset category:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to reset category' });
      }
    },

    resetAllSettings: async (): Promise<void> => {
      try {
        await settingsService.resetAllSettings();
        await get().loadAllSettings();
      } catch (error) {
        console.error('Failed to reset all settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to reset all settings' });
      }
    },

    // Utility actions
    saveSettings: async (): Promise<void> => {
      try {
        await settingsService.saveSettings();
        set({ hasUnsavedChanges: false });
      } catch (error) {
        console.error('Failed to save settings:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to save settings' });
      }
    },

    reloadSettings: async (): Promise<void> => {
      await get().loadAllSettings();
    },

    clearError: (): void => {
      set({ error: null });
    },
  }))
);

// Selector hooks for easy access to specific settings
export const useAppSettings = () => useSettingsStore((state) => state.appSettings);
export const useUserPreferences = () => useSettingsStore((state) => state.userPreferences);
export const useVideoSettings = () => useSettingsStore((state) => state.videoSettings);
export const useAudioSettings = () => useSettingsStore((state) => state.audioSettings);
export const useStorageSettings = () => useSettingsStore((state) => state.storageSettings);
export const useDeviceSettings = () => useSettingsStore((state) => state.deviceSettings);
export const useSecuritySettings = () => useSettingsStore((state) => state.securitySettings);
export const useAccessibilitySettings = () => useSettingsStore((state) => state.accessibilitySettings);
export const useExperimentalSettings = () => useSettingsStore((state) => state.experimentalSettings);
export const useActiveProfile = () => useSettingsStore((state) => state.activeProfile);
export const useSettingsLoading = () => useSettingsStore((state) => state.isLoading);
export const useSettingsError = () => useSettingsStore((state) => state.error);
export const useHasUnsavedChanges = () => useSettingsStore((state) => state.hasUnsavedChanges);