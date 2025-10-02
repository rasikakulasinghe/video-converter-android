import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  ThermalState,
  PerformanceMetrics,
  ResourceAlert,
  DeviceCapabilityCheck,
} from '../services/DeviceMonitorService';
import { AndroidDeviceMonitor } from '../services/implementations/AndroidDeviceMonitor';
import { ErrorLogger, ErrorSeverity } from '../services/ErrorLogger';

/**
 * Device monitor service instance
 * Uses real Android device monitoring implementation
 */
const deviceMonitor = new AndroidDeviceMonitor();

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
        ErrorLogger.logActionError('DeviceStore', 'start monitoring', error, ErrorSeverity.HIGH);
      }
    },

    stopMonitoring: async () => {
      try {
        await deviceMonitor.stopMonitoring();
        set({ isMonitoring: false });
      } catch (error) {
        ErrorLogger.logActionError('DeviceStore', 'stop monitoring', error, ErrorSeverity.MEDIUM);
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
        ErrorLogger.logActionError('DeviceStore', 'update metrics', error, ErrorSeverity.MEDIUM);
      }
    },

    checkCapabilities: async () => {
      try {
        const capabilities = await deviceMonitor.checkDeviceCapabilities();
        set({ deviceCapabilities: capabilities });
      } catch (error) {
        ErrorLogger.logActionError('DeviceStore', 'check capabilities', error, ErrorSeverity.LOW);
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
