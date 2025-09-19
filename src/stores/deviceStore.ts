import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Platform } from 'react-native';
import {
  DeviceMonitorService,
  ThermalState,
  PerformanceMetrics,
  ResourceAlert,
  DeviceCapabilityCheck,
} from '../services/DeviceMonitorService';

// Basic device monitor implementation for now (simplified)
class BasicDeviceMonitor {
  async startMonitoring(): Promise<void> {}
  async stopMonitoring(): Promise<void> {}
  async getThermalState(): Promise<ThermalState> { return ThermalState.NOMINAL; }
  async startThermalMonitoring(): Promise<any> { return { stop: () => {} }; }
  async stopThermalMonitoring(): Promise<void> {}
  async getBatteryInfo(): Promise<any> { return { level: 1, isCharging: false }; }
  async getMemoryInfo(): Promise<any> { return { totalRAM: 8000000000, availableRAM: 4000000000, usedRAM: 4000000000 }; }
  async getStorageInfo(): Promise<any> { return { totalSpace: 64000000000, availableSpace: 32000000000 }; }
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      sessionId: 'basic_session',
      startTime: new Date(),
      endTime: new Date(),
      averageCpuUsage: 30,
      peakCpuUsage: 50,
      averageMemoryUsage: 40,
      peakMemoryUsage: 60,
      thermalEvents: 0,
      batteryDrain: 5,
      alertsTriggered: 0,
      performanceScore: 90,
    };
  }
  async checkDeviceCapabilities(): Promise<DeviceCapabilityCheck> {
    return {
      canEncodeVideo: true,
      canDecodeVideo: true,
      supportedCodecs: ['h264', 'hevc'],
      maxVideoResolution: '1080p',
      maxFrameRate: 60,
      supportsHardwareAcceleration: Platform.OS === 'android',
      thermalMonitoringAvailable: true,
      batteryMonitoringAvailable: true,
      memoryMonitoringAvailable: true,
    };
  }
  async getResourceAlerts(): Promise<ResourceAlert[]> { return []; }
  onResourceAlert(): () => void { return () => {}; }
  onDeviceEvent(): () => void { return () => {}; }
  async optimizeForVideoProcessing(): Promise<void> {}
  async restoreNormalPerformance(): Promise<void> {}
  async isLowPowerMode(): Promise<boolean> { return false; }
  async enableLowPowerMode(): Promise<void> {}
  async disableLowPowerMode(): Promise<void> {}
  
  // Add missing methods to satisfy interface
  async startBatteryMonitoring(): Promise<any> { return { stop: () => {} }; }
  async stopBatteryMonitoring(): Promise<void> {}
  async startMemoryMonitoring(): Promise<any> { return { stop: () => {} }; }
  async stopMemoryMonitoring(): Promise<void> {}
  async startStorageMonitoring(): Promise<any> { return { stop: () => {} }; }
  async stopStorageMonitoring(): Promise<void> {}
  async startPerformanceMonitoring(): Promise<any> { return { stop: () => {} }; }
  async stopPerformanceMonitoring(): Promise<void> {}
  async getCpuInfo(): Promise<any> { return { cores: 8, frequency: 2400 }; }
  async getNetworkInfo(): Promise<any> { return { type: 'wifi', speed: 100 }; }
  async getPowerState(): Promise<any> { return { isLowPowerMode: false, batteryOptimized: false }; }
  async getDeviceHealth(): Promise<any> { return { status: 'healthy', score: 95 }; }
  async updatePerformanceProfile(): Promise<void> {}
  async getOptimizationRecommendations(): Promise<any[]> { return []; }
  async applyOptimization(): Promise<void> {}
  async revertOptimization(): Promise<void> {}
  async getActiveOptimizations(): Promise<any[]> { return []; }
  async setResourceThreshold(): Promise<void> {}
  async clearResourceThreshold(): Promise<void> {}
  async getResourceThresholds(): Promise<any[]> { return []; }
  async getResourceUsageHistory(): Promise<any[]> { return []; }
  async clearResourceUsageHistory(): Promise<void> {}
  async exportPerformanceReport(): Promise<string> { return ''; }
  async checkHardwareFeature(): Promise<any> { return { available: true, supported: true }; }
  async getAvailableFeatures(): Promise<any[]> { return []; }
  async enableFeature(): Promise<void> {}
  async disableFeature(): Promise<void> {}
  async getFeatureStatus(): Promise<any> { return { enabled: true }; }
  async resetToDefaults(): Promise<void> {}
  async validateConfiguration(): Promise<boolean> { return true; }
  async getConfigurationSummary(): Promise<any> { return {}; }
}

/**
 * Simplified device monitoring store
 */
interface DeviceState {
  // Device status data
  thermalState: ThermalState | null;
  batteryLevel: number | null;
  memoryUsage: number | null;
  storageAvailable: number | null;
  isMonitoring: boolean;
  performanceMetrics: PerformanceMetrics | null;
  deviceCapabilities: DeviceCapabilityCheck | null;
  resourceAlerts: ResourceAlert[];

  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  updateMetrics: () => Promise<void>;
  checkCapabilities: () => Promise<void>;
  clearAlerts: () => void;
}

const deviceMonitor = new BasicDeviceMonitor();

/**
 * Device monitoring store with Zustand
 */
export const useDeviceStore = create<DeviceState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    thermalState: null,
    batteryLevel: null,
    memoryUsage: null,
    storageAvailable: null,
    isMonitoring: false,
    performanceMetrics: null,
    deviceCapabilities: null,
    resourceAlerts: [],

    // Actions
    startMonitoring: async () => {
      try {
        await deviceMonitor.startMonitoring();
        set({ isMonitoring: true });
        await get().updateMetrics();
      } catch (error) {
        console.error('Failed to start monitoring:', error);
      }
    },

    stopMonitoring: async () => {
      try {
        await deviceMonitor.stopMonitoring();
        set({ isMonitoring: false });
      } catch (error) {
        console.error('Failed to stop monitoring:', error);
      }
    },

    updateMetrics: async () => {
      try {
        const [thermalState, batteryInfo, memoryInfo, storageInfo, performanceMetrics] = await Promise.all([
          deviceMonitor.getThermalState(),
          deviceMonitor.getBatteryInfo(),
          deviceMonitor.getMemoryInfo(),
          deviceMonitor.getStorageInfo(),
          deviceMonitor.getPerformanceMetrics(),
        ]);

        set({
          thermalState,
          batteryLevel: batteryInfo.level,
          memoryUsage: (memoryInfo.usedRAM / memoryInfo.totalRAM) * 100,
          storageAvailable: storageInfo.availableSpace,
          performanceMetrics,
        });
      } catch (error) {
        console.error('Failed to update metrics:', error);
      }
    },

    checkCapabilities: async () => {
      try {
        const capabilities = await deviceMonitor.checkDeviceCapabilities();
        set({ deviceCapabilities: capabilities });
      } catch (error) {
        console.error('Failed to check capabilities:', error);
      }
    },

    clearAlerts: () => {
      set({ resourceAlerts: [] });
    },
  }))
);