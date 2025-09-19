/**
 * @fileoverview Integration tests for device resource management during video processing
 * Tests basic resource monitoring and conversion workflow
 * 
 * Constitutional Requirements:
 * - Test Coverage: Device resource management validation
 * - Mobile-Specific: Android device capabilities and limitations
 * - Performance: Resource monitoring during intensive operations
 */

import { jest } from '@jest/globals';

// Import services
import { AndroidDeviceMonitor } from '../../src/services/implementations/AndroidDeviceMonitor';
import { ThermalState } from '../../src/services/DeviceMonitorService';

describe('ResourceManagement Integration Tests', () => {
  let deviceMonitor: AndroidDeviceMonitor;
  
  beforeEach(() => {
    deviceMonitor = new AndroidDeviceMonitor();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any running monitoring intervals
    await deviceMonitor.stopMonitoring();
  });

  describe('Device Monitor Integration', () => {
    it('should successfully create and initialize device monitor', async () => {
      expect(deviceMonitor).toBeDefined();
      
      // Test basic monitor methods exist
      expect(typeof deviceMonitor.startMonitoring).toBe('function');
      expect(typeof deviceMonitor.stopMonitoring).toBe('function');
      expect(typeof deviceMonitor.getThermalState).toBe('function');
    });

    it('should start and stop monitoring successfully', async () => {
      await expect(deviceMonitor.startMonitoring()).resolves.toBeUndefined();
      await expect(deviceMonitor.stopMonitoring()).resolves.toBeUndefined();
    });

    it('should get thermal state', async () => {
      const thermalState = await deviceMonitor.getThermalState();
      expect(Object.values(ThermalState)).toContain(thermalState);
    });

    it('should get battery info', async () => {
      const batteryInfo = await deviceMonitor.getBatteryInfo();
      expect(batteryInfo).toBeDefined();
      expect(typeof batteryInfo.level).toBe('number');
      expect(typeof batteryInfo.isCharging).toBe('boolean');
    });

    it('should get memory info', async () => {
      const memoryInfo = await deviceMonitor.getMemoryInfo();
      expect(memoryInfo).toBeDefined();
      expect(typeof memoryInfo.totalRAM).toBe('number');
      expect(typeof memoryInfo.availableRAM).toBe('number');
      expect(typeof memoryInfo.usedRAM).toBe('number');
    });

    it('should get storage info', async () => {
      const storageInfo = await deviceMonitor.getStorageInfo();
      expect(storageInfo).toBeDefined();
      expect(typeof storageInfo.totalSpace).toBe('number');
      expect(typeof storageInfo.availableSpace).toBe('number');
    });

    it('should check device capabilities', async () => {
      const capabilities = await deviceMonitor.checkDeviceCapabilities();
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.canEncodeVideo).toBe('boolean');
      expect(typeof capabilities.canDecodeVideo).toBe('boolean');
      expect(Array.isArray(capabilities.supportedCodecs)).toBe(true);
    });

    it('should get performance metrics', async () => {
      const metrics = await deviceMonitor.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.averageCpuUsage).toBe('number');
      expect(typeof metrics.averageMemoryUsage).toBe('number');
      expect(typeof metrics.performanceScore).toBe('number');
    });
  });

  describe('Resource Monitoring Workflow', () => {
    it('should handle complete monitoring lifecycle', async () => {
      // Start monitoring
      await deviceMonitor.startMonitoring();
      
      // Check various resources
      const [thermalState, batteryInfo, memoryInfo, storageInfo] = await Promise.all([
        deviceMonitor.getThermalState(),
        deviceMonitor.getBatteryInfo(),
        deviceMonitor.getMemoryInfo(),
        deviceMonitor.getStorageInfo(),
      ]);

      // Verify all resources are accessible
      expect(thermalState).toBeDefined();
      expect(batteryInfo).toBeDefined();
      expect(memoryInfo).toBeDefined();
      expect(storageInfo).toBeDefined();
      
      // Stop monitoring
      await deviceMonitor.stopMonitoring();
    });

    it('should handle resource alerts', async () => {
      const alerts = await deviceMonitor.getResourceAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should optimize for video processing', async () => {
      await expect(deviceMonitor.optimizeForVideoProcessing()).resolves.toBeUndefined();
      await expect(deviceMonitor.restoreNormalPerformance()).resolves.toBeUndefined();
    });
  });
});