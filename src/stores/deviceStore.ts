import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Platform } from 'react-native';
import {
  DeviceMonitorService,
  ThermalState,
  PerformanceMetrics,
  ResourceAlert,
  DeviceCapabilityCheck,
  BatteryInfo,
  MemoryInfo,
  DeviceStorageInfo,
} from '../services/DeviceMonitorService';

/**
 * Minimal device monitor implementation
 * TODO: Replace with actual native module integration
 */
class MockDeviceMonitor implements Partial<DeviceMonitorService> {
  async startMonitoring(): Promise<void> {
    // TODO: Implement actual device monitoring
  }

  async stopMonitoring(): Promise<void> {
    // TODO: Implement monitoring cleanup
  }

  async getThermalState(): Promise<ThermalState> {
    return ThermalState.NOMINAL;
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    return {
      level: 0.8,
      isCharging: false,
      chargingSource: null,
      temperature: 25,
      voltage: 3.8,
      health: 'Good',
      timeRemaining: null,
      estimatedTimeToFull: null,
      powerSaveMode: false,
    };
  }

  async getMemoryInfo(): Promise<MemoryInfo> {
    const totalRAM = 8 * 1024 * 1024 * 1024; // 8GB
    const usedRAM = 4 * 1024 * 1024 * 1024; // 4GB
    const availableRAM = totalRAM - usedRAM;
    return {
      totalRAM,
      availableRAM,
      usedRAM,
      freeRAM: availableRAM,
      usagePercentage: (usedRAM / totalRAM) * 100,
      appMemoryUsage: 512 * 1024 * 1024, // 512MB
      systemMemoryUsage: usedRAM - 512 * 1024 * 1024,
      cacheMemoryUsage: 256 * 1024 * 1024, // 256MB
      swapUsage: 0,
      memoryPressure: 'normal',
    };
  }

  async getStorageInfo(): Promise<DeviceStorageInfo> {
    const totalSpace = 128 * 1024 * 1024 * 1024; // 128GB
    const availableSpace = 64 * 1024 * 1024 * 1024; // 64GB
    const usedSpace = totalSpace - availableSpace;
    return {
      totalSpace,
      usedSpace,
      availableSpace,
      usagePercentage: (usedSpace / totalSpace) * 100,
      location: 'internal',
      path: '/storage/emulated/0',
    };
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      sessionId: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      averageCpuUsage: 30,
      peakCpuUsage: 50,
      averageMemoryUsage: 50,
      peakMemoryUsage: 70,
      thermalEvents: 0,
      batteryDrain: 5,
      alertsTriggered: 0,
      performanceScore: 85,
    };
  }

  async checkDeviceCapabilities(): Promise<DeviceCapabilityCheck> {
    return {
      canEncodeVideo: true,
      canDecodeVideo: true,
      supportedCodecs: ['h264', 'hevc', 'vp8', 'vp9'],
      maxVideoResolution: '1080p',
      maxFrameRate: 60,
      supportsHardwareAcceleration: Platform.OS === 'android',
      thermalMonitoringAvailable: Platform.OS === 'android',
      batteryMonitoringAvailable: true,
      memoryMonitoringAvailable: true,
    };
  }

  async getResourceAlerts(): Promise<ResourceAlert[]> {
    return [];
  }
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
  reset: () => void;
}

const deviceMonitor = new MockDeviceMonitor();

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

    reset: () => {
      set({
        thermalState: null,
        batteryLevel: null,
        memoryUsage: null,
        storageAvailable: null,
        isMonitoring: false,
        performanceMetrics: null,
        deviceCapabilities: null,
        resourceAlerts: [],
      });
    },
  }))
);