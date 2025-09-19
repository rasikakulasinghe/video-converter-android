import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  DeviceMonitorService,
  ThermalState,
  BatteryInfo,
  MemoryInfo,
  DeviceStorageInfo,
  CpuInfo,
  NetworkInfo,
  PowerState,
  DevicePerformanceProfile,
  ResourceAlert,
  MonitoringSession,
  DeviceHealthStatus,
  ResourceUsageSnapshot,
  PerformanceMetrics,
  DeviceEvent,
  DeviceEventType,
  OptimizationRecommendation,
  ResourceThreshold,
  PerformanceLimitType,
  MonitoringConfig,
  HardwareFeature,
  FeatureAvailability,
  DeviceCapabilityCheck,
} from '../services/DeviceMonitorService';
import { AndroidDeviceMonitor } from '../services/implementations/AndroidDeviceMonitor';

/**
 * Device monitoring store state interface
 */
interface DeviceState {
  // Device status data
  thermalState: ThermalState | null;
  batteryInfo: BatteryInfo | null;
  memoryInfo: MemoryInfo | null;
  storageInfo: DeviceStorageInfo | null;
  cpuInfo: CpuInfo | null;
  networkInfo: NetworkInfo | null;
  powerState: PowerState | null;
  deviceHealth: DeviceHealthStatus | null;
  deviceCapabilities: DeviceCapabilityCheck | null;

  // Performance monitoring
  activeProfile: DevicePerformanceProfile | null;
  activeAlerts: ResourceAlert[];
  activeSessions: MonitoringSession[];
  resourceSnapshots: ResourceUsageSnapshot[];
  performanceMetrics: PerformanceMetrics | null;
  
  // Optimization
  optimizationRecommendations: OptimizationRecommendation[];
  appliedOptimizations: string[];
  
  // Hardware features
  availableFeatures: FeatureAvailability[];
  
  // UI state
  isMonitoring: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  
  // Computed properties for MainScreen compatibility
  batteryLevel: number;
  isLowPowerMode: boolean;
  availableStorage: number;

  // Actions
  loadDeviceInfo: () => Promise<void>;
  
  // Thermal monitoring actions
  startThermalMonitoring: (interval?: number) => Promise<void>;
  stopThermalMonitoring: () => Promise<void>;
  
  // Battery monitoring actions
  startBatteryMonitoring: (interval?: number) => Promise<void>;
  stopBatteryMonitoring: () => Promise<void>;
  
  // Memory monitoring actions
  startMemoryMonitoring: (interval?: number) => Promise<void>;
  stopMemoryMonitoring: () => Promise<void>;
  
  // Storage monitoring actions
  startStorageMonitoring: (interval?: number) => Promise<void>;
  stopStorageMonitoring: () => Promise<void>;
  
  // CPU monitoring actions
  startCpuMonitoring: (interval?: number) => Promise<void>;
  stopCpuMonitoring: () => Promise<void>;
  
  // Network monitoring actions
  startNetworkMonitoring: (interval?: number) => Promise<void>;
  stopNetworkMonitoring: () => Promise<void>;
  
  // Comprehensive monitoring
  startComprehensiveMonitoring: (config?: Partial<MonitoringConfig>) => Promise<void>;
  stopAllMonitoring: () => Promise<void>;
  
  // Performance profile actions
  setPerformanceProfile: (profileName: string) => Promise<void>;
  optimizeForTask: (taskType: string) => Promise<void>;
  resetPerformanceProfile: () => Promise<void>;
  
  // Alert management
  refreshAlerts: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  dismissAllAlerts: () => Promise<void>;
  
  // Resource management
  takeSnapshot: () => Promise<void>;
  checkResourceLimits: () => Promise<void>;
  setResourceThreshold: (type: PerformanceLimitType, threshold: ResourceThreshold) => Promise<void>;
  clearResourceThreshold: (type: PerformanceLimitType) => Promise<void>;
  
  // Optimization actions
  loadOptimizationRecommendations: (context?: string) => Promise<void>;
  applyOptimization: (optimizationId: string) => Promise<void>;
  resetOptimizations: () => Promise<void>;
  
  // Hardware feature checks
  checkHardwareFeature: (feature: HardwareFeature) => Promise<FeatureAvailability>;
  loadAvailableFeatures: () => Promise<void>;
  
  // Device health checks
  isDeviceOverheating: () => Promise<boolean>;
  isLowBattery: (threshold?: number) => Promise<boolean>;
  isLowMemory: (threshold?: number) => Promise<boolean>;
  isLowStorage: (threshold?: number) => Promise<boolean>;
  
  // Auto-refresh controls
  enableAutoRefresh: (interval?: number) => void;
  disableAutoRefresh: () => void;
  
  // Utility actions
  refreshDeviceData: () => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
}

// Create service instance (mock implementation for now)
const deviceMonitorService: DeviceMonitorService = new AndroidDeviceMonitor() as unknown as DeviceMonitorService;

// Default monitoring config
const defaultMonitoringConfig: MonitoringConfig = {
  interval: 5000, // 5 seconds
  enableAlerts: true,
  thresholds: {
    cpu: 80,
    memory: 85,
    battery: 20,
    thermal: ThermalState.SERIOUS,
    storage: 90,
  },
  features: ['thermal', 'battery', 'memory', 'cpu', 'storage'],
};

/**
 * Zustand store for device monitoring and performance management
 */
export const useDeviceStore = create<DeviceState>()(
  subscribeWithSelector((set, get) => {
    let autoRefreshTimer: NodeJS.Timeout | null = null;
    let eventSubscriptionId: string | null = null;
    let activeSessions: { [key: string]: MonitoringSession } = {};

    // Helper function to compute derived properties
    const computeDerivedProperties = (state: Partial<DeviceState>) => {
      const currentState = get();
      const batteryLevel = state.batteryInfo?.level ?? currentState.batteryLevel;
      const isLowPowerMode = state.powerState?.isPowerSaveMode ?? currentState.isLowPowerMode;
      const availableStorage = state.storageInfo?.availableSpace ?? currentState.availableStorage;
      
      return {
        batteryLevel,
        isLowPowerMode,
        availableStorage,
      };
    };

    return {
      // Initial state
      thermalState: null,
      batteryInfo: null,
      memoryInfo: null,
      storageInfo: null,
      cpuInfo: null,
      networkInfo: null,
      powerState: null,
      deviceHealth: null,
      deviceCapabilities: null,
      activeProfile: null,
      activeAlerts: [],
      activeSessions: [],
      resourceSnapshots: [],
      performanceMetrics: null,
      optimizationRecommendations: [],
      appliedOptimizations: [],
      availableFeatures: [],
      isMonitoring: false,
      isLoading: false,
      error: null,
      lastUpdate: null,
      autoRefreshEnabled: false,
      autoRefreshInterval: 10000,
      
      // Computed properties initial values
      batteryLevel: 0,
      isLowPowerMode: false,
      availableStorage: 0,

      // Core loading action
      loadDeviceInfo: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          const [
            thermalState,
            batteryInfo,
            memoryInfo,
            storageInfo,
            cpuInfo,
            networkInfo,
            powerState,
            deviceHealth,
            deviceCapabilities,
            activeProfile,
          ] = await Promise.all([
            deviceMonitorService.getThermalState(),
            deviceMonitorService.getBatteryInfo(),
            deviceMonitorService.getMemoryInfo(),
            deviceMonitorService.getStorageInfo(),
            deviceMonitorService.getCpuInfo(),
            deviceMonitorService.getNetworkInfo(),
            deviceMonitorService.getPowerState(),
            deviceMonitorService.getDeviceHealth(),
            deviceMonitorService.getDeviceCapabilities(),
            deviceMonitorService.getPerformanceProfile(),
          ]);

          const newState = {
            thermalState,
            batteryInfo,
            memoryInfo,
            storageInfo,
            cpuInfo,
            networkInfo,
            powerState,
            deviceHealth,
            deviceCapabilities,
            activeProfile,
            lastUpdate: new Date(),
            isLoading: false,
          };
          
          set({
            ...newState,
            ...computeDerivedProperties(newState),
          });
        } catch (error) {
          console.error('Failed to load device info:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load device info',
            isLoading: false,
          });
        }
      },

      // Thermal monitoring
      startThermalMonitoring: async (interval = 5000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startThermalMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.THERMAL_STATE_CHANGED) {
                set({ thermalState: event.data['thermalState'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start thermal monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start thermal monitoring' });
        }
      },

      stopThermalMonitoring: async (): Promise<void> => {
        const thermalSession = Object.values(activeSessions).find(s => s.type === 'thermal');
        if (thermalSession) {
          try {
            await deviceMonitorService.stopThermalMonitoring(thermalSession.id);
            delete activeSessions[thermalSession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop thermal monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop thermal monitoring' });
          }
        }
      },

      // Battery monitoring
      startBatteryMonitoring: async (interval = 10000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startBatteryMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.BATTERY_LEVEL_CHANGED) {
                set({ batteryInfo: event.data['batteryInfo'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start battery monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start battery monitoring' });
        }
      },

      stopBatteryMonitoring: async (): Promise<void> => {
        const batterySession = Object.values(activeSessions).find(s => s.type === 'battery');
        if (batterySession) {
          try {
            await deviceMonitorService.stopBatteryMonitoring(batterySession.id);
            delete activeSessions[batterySession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop battery monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop battery monitoring' });
          }
        }
      },

      // Memory monitoring
      startMemoryMonitoring: async (interval = 5000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startMemoryMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.MEMORY_PRESSURE_CHANGED) {
                set({ memoryInfo: event.data['memoryInfo'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start memory monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start memory monitoring' });
        }
      },

      stopMemoryMonitoring: async (): Promise<void> => {
        const memorySession = Object.values(activeSessions).find(s => s.type === 'memory');
        if (memorySession) {
          try {
            await deviceMonitorService.stopMemoryMonitoring(memorySession.id);
            delete activeSessions[memorySession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop memory monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop memory monitoring' });
          }
        }
      },

      // Storage monitoring
      startStorageMonitoring: async (interval = 30000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startStorageMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.STORAGE_WARNING) {
                set({ storageInfo: event.data['storageInfo'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start storage monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start storage monitoring' });
        }
      },

      stopStorageMonitoring: async (): Promise<void> => {
        const storageSession = Object.values(activeSessions).find(s => s.type === 'storage');
        if (storageSession) {
          try {
            await deviceMonitorService.stopStorageMonitoring(storageSession.id);
            delete activeSessions[storageSession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop storage monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop storage monitoring' });
          }
        }
      },

      // CPU monitoring
      startCpuMonitoring: async (interval = 3000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startCpuMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.CPU_THROTTLING_STARTED || 
                  event.type === DeviceEventType.CPU_THROTTLING_STOPPED) {
                set({ cpuInfo: event.data['cpuInfo'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start CPU monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start CPU monitoring' });
        }
      },

      stopCpuMonitoring: async (): Promise<void> => {
        const cpuSession = Object.values(activeSessions).find(s => s.type === 'cpu');
        if (cpuSession) {
          try {
            await deviceMonitorService.stopCpuMonitoring(cpuSession.id);
            delete activeSessions[cpuSession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop CPU monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop CPU monitoring' });
          }
        }
      },

      // Network monitoring
      startNetworkMonitoring: async (interval = 10000): Promise<void> => {
        try {
          const session = await deviceMonitorService.startNetworkMonitoring(
            (event: DeviceEvent) => {
              if (event.type === DeviceEventType.NETWORK_STATE_CHANGED) {
                set({ networkInfo: event.data['networkInfo'] });
              }
            },
            interval
          );
          
          activeSessions[session.id] = session;
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start network monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start network monitoring' });
        }
      },

      stopNetworkMonitoring: async (): Promise<void> => {
        const networkSession = Object.values(activeSessions).find(s => s.type === 'network');
        if (networkSession) {
          try {
            await deviceMonitorService.stopNetworkMonitoring(networkSession.id);
            delete activeSessions[networkSession.id];
            set({ activeSessions: Object.values(activeSessions) });
          } catch (error) {
            console.error('Failed to stop network monitoring:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to stop network monitoring' });
          }
        }
      },

      // Comprehensive monitoring
      startComprehensiveMonitoring: async (configOverrides?: Partial<MonitoringConfig>): Promise<void> => {
        try {
          const config = { ...defaultMonitoringConfig, ...configOverrides };
          
          // Subscribe to device events
          if (!eventSubscriptionId) {
            eventSubscriptionId = await deviceMonitorService.subscribeToEvents(
              [
                DeviceEventType.THERMAL_STATE_CHANGED,
                DeviceEventType.BATTERY_LEVEL_CHANGED,
                DeviceEventType.MEMORY_PRESSURE_CHANGED,
                DeviceEventType.CPU_THROTTLING_STARTED,
                DeviceEventType.CPU_THROTTLING_STOPPED,
                DeviceEventType.NETWORK_STATE_CHANGED,
                DeviceEventType.STORAGE_WARNING,
                DeviceEventType.PERFORMANCE_PROFILE_CHANGED,
              ],
              (event: DeviceEvent) => {
                // Handle real-time updates based on event type
                switch (event.type) {
                  case DeviceEventType.THERMAL_STATE_CHANGED:
                    set({ thermalState: event.data['thermalState'] });
                    break;
                  case DeviceEventType.BATTERY_LEVEL_CHANGED:
                    set({ batteryInfo: event.data['batteryInfo'] });
                    break;
                  case DeviceEventType.MEMORY_PRESSURE_CHANGED:
                    set({ memoryInfo: event.data['memoryInfo'] });
                    break;
                  case DeviceEventType.NETWORK_STATE_CHANGED:
                    set({ networkInfo: event.data['networkInfo'] });
                    break;
                  case DeviceEventType.STORAGE_WARNING:
                    set({ storageInfo: event.data['storageInfo'] });
                    break;
                  case DeviceEventType.PERFORMANCE_PROFILE_CHANGED:
                    set({ activeProfile: event.data['profile'] });
                    break;
                }
              }
            );
          }

          const session = await deviceMonitorService.startMonitoringSession(config);
          activeSessions[session.id] = session;
          
          set({ 
            activeSessions: Object.values(activeSessions),
            isMonitoring: true,
          });
        } catch (error) {
          console.error('Failed to start comprehensive monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to start comprehensive monitoring' });
        }
      },

      stopAllMonitoring: async (): Promise<void> => {
        try {
          // Stop all active sessions
          for (const session of Object.values(activeSessions)) {
            await deviceMonitorService.stopMonitoringSession(session.id);
          }
          
          // Unsubscribe from events
          if (eventSubscriptionId) {
            await deviceMonitorService.unsubscribeFromEvents(eventSubscriptionId);
            eventSubscriptionId = null;
          }
          
          activeSessions = {};
          set({ 
            activeSessions: [],
            isMonitoring: false,
          });
        } catch (error) {
          console.error('Failed to stop all monitoring:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to stop all monitoring' });
        }
      },

      // Performance profile actions
      setPerformanceProfile: async (profileName: string): Promise<void> => {
        try {
          await deviceMonitorService.setPerformanceProfile(profileName);
          const updatedProfile = await deviceMonitorService.getPerformanceProfile();
          set({ activeProfile: updatedProfile });
        } catch (error) {
          console.error('Failed to set performance profile:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to set performance profile' });
        }
      },

      optimizeForTask: async (taskType: string): Promise<void> => {
        try {
          const optimizedProfile = await deviceMonitorService.optimizeForTask(taskType);
          set({ activeProfile: optimizedProfile });
        } catch (error) {
          console.error('Failed to optimize for task:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to optimize for task' });
        }
      },

      resetPerformanceProfile: async (): Promise<void> => {
        try {
          await deviceMonitorService.resetOptimizations();
          const defaultProfile = await deviceMonitorService.getPerformanceProfile();
          set({ 
            activeProfile: defaultProfile,
            appliedOptimizations: [],
          });
        } catch (error) {
          console.error('Failed to reset performance profile:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to reset performance profile' });
        }
      },

      // Alert management
      refreshAlerts: async (): Promise<void> => {
        try {
          const alerts = await deviceMonitorService.getActiveAlerts();
          set({ activeAlerts: alerts });
        } catch (error) {
          console.error('Failed to refresh alerts:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to refresh alerts' });
        }
      },

      dismissAlert: async (alertId: string): Promise<void> => {
        try {
          await deviceMonitorService.dismissAlert(alertId);
          const { activeAlerts } = get();
          set({ activeAlerts: activeAlerts.filter(alert => alert.id !== alertId) });
        } catch (error) {
          console.error('Failed to dismiss alert:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to dismiss alert' });
        }
      },

      dismissAllAlerts: async (): Promise<void> => {
        try {
          const { activeAlerts } = get();
          for (const alert of activeAlerts) {
            await deviceMonitorService.dismissAlert(alert.id);
          }
          set({ activeAlerts: [] });
        } catch (error) {
          console.error('Failed to dismiss all alerts:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to dismiss all alerts' });
        }
      },

      // Resource management
      takeSnapshot: async (): Promise<void> => {
        try {
          const snapshot = await deviceMonitorService.takeResourceSnapshot();
          const { resourceSnapshots } = get();
          set({ 
            resourceSnapshots: [...resourceSnapshots, snapshot].slice(-50), // Keep last 50 snapshots
            lastUpdate: new Date(),
          });
        } catch (error) {
          console.error('Failed to take resource snapshot:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to take resource snapshot' });
        }
      },

      checkResourceLimits: async (): Promise<void> => {
        try {
          const alerts = await deviceMonitorService.checkResourceLimits();
          const { activeAlerts } = get();
          const newAlerts = alerts.filter(alert => 
            !activeAlerts.some(existing => existing.id === alert.id)
          );
          set({ activeAlerts: [...activeAlerts, ...newAlerts] });
        } catch (error) {
          console.error('Failed to check resource limits:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check resource limits' });
        }
      },

      setResourceThreshold: async (type: PerformanceLimitType, threshold: ResourceThreshold): Promise<void> => {
        try {
          await deviceMonitorService.setResourceThreshold(type, threshold);
        } catch (error) {
          console.error('Failed to set resource threshold:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to set resource threshold' });
        }
      },

      clearResourceThreshold: async (type: PerformanceLimitType): Promise<void> => {
        try {
          await deviceMonitorService.clearResourceThreshold(type);
        } catch (error) {
          console.error('Failed to clear resource threshold:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to clear resource threshold' });
        }
      },

      // Optimization actions
      loadOptimizationRecommendations: async (context?: string): Promise<void> => {
        try {
          const recommendations = await deviceMonitorService.getOptimizationRecommendations(context);
          set({ optimizationRecommendations: recommendations });
        } catch (error) {
          console.error('Failed to load optimization recommendations:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load optimization recommendations' });
        }
      },

      applyOptimization: async (optimizationId: string): Promise<void> => {
        try {
          await deviceMonitorService.applyOptimization(optimizationId);
          const { appliedOptimizations } = get();
          set({ appliedOptimizations: [...appliedOptimizations, optimizationId] });
        } catch (error) {
          console.error('Failed to apply optimization:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to apply optimization' });
        }
      },

      resetOptimizations: async (): Promise<void> => {
        try {
          await deviceMonitorService.resetOptimizations();
          set({ appliedOptimizations: [] });
        } catch (error) {
          console.error('Failed to reset optimizations:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to reset optimizations' });
        }
      },

      // Hardware feature checks
      checkHardwareFeature: async (feature: HardwareFeature): Promise<FeatureAvailability> => {
        try {
          return await deviceMonitorService.checkHardwareFeature(feature);
        } catch (error) {
          console.error('Failed to check hardware feature:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check hardware feature' });
          throw error;
        }
      },

      loadAvailableFeatures: async (): Promise<void> => {
        try {
          const features = Object.values(HardwareFeature);
          const featureChecks = await Promise.all(
            features.map(feature => deviceMonitorService.checkHardwareFeature(feature))
          );
          set({ availableFeatures: featureChecks });
        } catch (error) {
          console.error('Failed to load available features:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load available features' });
        }
      },

      // Device health checks
      isDeviceOverheating: async (): Promise<boolean> => {
        try {
          return await deviceMonitorService.isDeviceOverheating();
        } catch (error) {
          console.error('Failed to check if device is overheating:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check if device is overheating' });
          return false;
        }
      },

      isLowBattery: async (threshold?: number): Promise<boolean> => {
        try {
          return await deviceMonitorService.isLowBattery(threshold);
        } catch (error) {
          console.error('Failed to check if battery is low:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check if battery is low' });
          return false;
        }
      },

      isLowMemory: async (threshold?: number): Promise<boolean> => {
        try {
          return await deviceMonitorService.isLowMemory(threshold);
        } catch (error) {
          console.error('Failed to check if memory is low:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check if memory is low' });
          return false;
        }
      },

      isLowStorage: async (threshold?: number): Promise<boolean> => {
        try {
          return await deviceMonitorService.isLowStorage(threshold);
        } catch (error) {
          console.error('Failed to check if storage is low:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to check if storage is low' });
          return false;
        }
      },

      // Auto-refresh controls
      enableAutoRefresh: (interval = 10000): void => {
        const { disableAutoRefresh } = get();
        disableAutoRefresh(); // Clear any existing timer
        
        autoRefreshTimer = setInterval(async () => {
          const { isLoading } = get();
          if (!isLoading) {
            await get().refreshDeviceData();
          }
        }, interval);
        
        set({ 
          autoRefreshEnabled: true,
          autoRefreshInterval: interval,
        });
      },

      disableAutoRefresh: (): void => {
        if (autoRefreshTimer) {
          clearInterval(autoRefreshTimer);
          autoRefreshTimer = null;
        }
        set({ autoRefreshEnabled: false });
      },

      // Utility actions
      refreshDeviceData: async (): Promise<void> => {
        const { isLoading } = get();
        if (isLoading) return; // Prevent concurrent refreshes
        
        await Promise.all([
          get().loadDeviceInfo(),
          get().refreshAlerts(),
          get().takeSnapshot(),
        ]);
      },

      clearError: (): void => {
        set({ error: null });
      },

      clearHistory: (): void => {
        set({ 
          resourceSnapshots: [],
          performanceMetrics: null,
        });
      },
    };
  })
);

// Selector hooks for easy access to specific device data
export const useThermalState = () => useDeviceStore((state) => state.thermalState);
export const useBatteryInfo = () => useDeviceStore((state) => state.batteryInfo);
export const useMemoryInfo = () => useDeviceStore((state) => state.memoryInfo);
export const useStorageInfo = () => useDeviceStore((state) => state.storageInfo);
export const useCpuInfo = () => useDeviceStore((state) => state.cpuInfo);
export const useNetworkInfo = () => useDeviceStore((state) => state.networkInfo);
export const usePowerState = () => useDeviceStore((state) => state.powerState);
export const useDeviceHealth = () => useDeviceStore((state) => state.deviceHealth);
export const useDeviceCapabilities = () => useDeviceStore((state) => state.deviceCapabilities);
export const useActiveProfile = () => useDeviceStore((state) => state.activeProfile);
export const useActiveAlerts = () => useDeviceStore((state) => state.activeAlerts);
export const useDeviceMonitoring = () => useDeviceStore((state) => state.isMonitoring);
export const useDeviceLoading = () => useDeviceStore((state) => state.isLoading);
export const useDeviceError = () => useDeviceStore((state) => state.error);
export const useResourceSnapshots = () => useDeviceStore((state) => state.resourceSnapshots);
export const useOptimizationRecommendations = () => useDeviceStore((state) => state.optimizationRecommendations);
export const useAvailableFeatures = () => useDeviceStore((state) => state.availableFeatures);