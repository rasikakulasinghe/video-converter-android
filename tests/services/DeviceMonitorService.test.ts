import {
  DeviceMonitorService,
  ThermalState,
  BatteryInfo,
  MemoryInfo,
  DeviceStorageInfo,
  CpuInfo,
  NetworkInfo,
  DevicePerformanceProfile,
  PerformanceLimit,
  PerformanceLimitType,
  ResourceThreshold,
  ResourceAlert,
  ResourceAlertType,
  ResourceAlertSeverity,
  MonitoringConfig,
  MonitoringSession,
  DeviceHealthStatus,
  PowerState,
  DeviceEvent,
  DeviceEventType,
  ResourceUsageSnapshot,
  PerformanceMetrics,
  OptimizationRecommendation,
  OptimizationType,
  DeviceCapabilityCheck,
  HardwareFeature,
  FeatureAvailability,
  DeviceMonitorError,
  DeviceMonitorErrorType,
} from '../../src/services/DeviceMonitorService';

describe('DeviceMonitorService Contract', () => {
  let mockDeviceMonitor: DeviceMonitorService;

  beforeEach(() => {
    // Create mock implementation
    mockDeviceMonitor = {
      // Thermal monitoring
      getThermalState: jest.fn(),
      startThermalMonitoring: jest.fn(),
      stopThermalMonitoring: jest.fn(),
      
      // Battery monitoring
      getBatteryInfo: jest.fn(),
      startBatteryMonitoring: jest.fn(),
      stopBatteryMonitoring: jest.fn(),
      
      // Memory monitoring
      getMemoryInfo: jest.fn(),
      startMemoryMonitoring: jest.fn(),
      stopMemoryMonitoring: jest.fn(),
      
      // Storage monitoring
      getStorageInfo: jest.fn(),
      startStorageMonitoring: jest.fn(),
      stopStorageMonitoring: jest.fn(),
      
      // CPU monitoring
      getCpuInfo: jest.fn(),
      startCpuMonitoring: jest.fn(),
      stopCpuMonitoring: jest.fn(),
      
      // Network monitoring
      getNetworkInfo: jest.fn(),
      startNetworkMonitoring: jest.fn(),
      stopNetworkMonitoring: jest.fn(),
      
      // Performance profiling
      getPerformanceProfile: jest.fn(),
      setPerformanceProfile: jest.fn(),
      optimizeForTask: jest.fn(),
      
      // Resource limits and thresholds
      setResourceThreshold: jest.fn(),
      getResourceThreshold: jest.fn(),
      clearResourceThreshold: jest.fn(),
      checkResourceLimits: jest.fn(),
      
      // Device capabilities
      checkHardwareFeature: jest.fn(),
      getDeviceCapabilities: jest.fn(),
      supportsVideoEncoding: jest.fn(),
      getMaxVideoResolution: jest.fn(),
      
      // Health and status
      getDeviceHealth: jest.fn(),
      getPowerState: jest.fn(),
      isDeviceOverheating: jest.fn(),
      isLowBattery: jest.fn(),
      isLowMemory: jest.fn(),
      isLowStorage: jest.fn(),
      
      // Monitoring sessions
      startMonitoringSession: jest.fn(),
      stopMonitoringSession: jest.fn(),
      getMonitoringSession: jest.fn(),
      
      // Events and alerts
      subscribeToEvents: jest.fn(),
      unsubscribeFromEvents: jest.fn(),
      getActiveAlerts: jest.fn(),
      dismissAlert: jest.fn(),
      
      // Performance optimization
      getOptimizationRecommendations: jest.fn(),
      applyOptimization: jest.fn(),
      resetOptimizations: jest.fn(),
      
      // Resource snapshots
      takeResourceSnapshot: jest.fn(),
      getResourceHistory: jest.fn(),
      exportResourceData: jest.fn(),
    };
  });

  describe('Interface Definition', () => {
    it('should define DeviceMonitorService interface with all required methods', () => {
      expect(mockDeviceMonitor).toHaveProperty('getThermalState');
      expect(mockDeviceMonitor).toHaveProperty('getBatteryInfo');
      expect(mockDeviceMonitor).toHaveProperty('getMemoryInfo');
      expect(mockDeviceMonitor).toHaveProperty('getStorageInfo');
      expect(mockDeviceMonitor).toHaveProperty('getCpuInfo');
      expect(mockDeviceMonitor).toHaveProperty('getNetworkInfo');
      expect(mockDeviceMonitor).toHaveProperty('getPerformanceProfile');
      expect(mockDeviceMonitor).toHaveProperty('setResourceThreshold');
      expect(mockDeviceMonitor).toHaveProperty('checkHardwareFeature');
      expect(mockDeviceMonitor).toHaveProperty('getDeviceHealth');
      expect(mockDeviceMonitor).toHaveProperty('startMonitoringSession');
      expect(mockDeviceMonitor).toHaveProperty('getOptimizationRecommendations');
    });

    it('should define ThermalState enum', () => {
      expect(ThermalState.NOMINAL).toBe('nominal');
      expect(ThermalState.FAIR).toBe('fair');
      expect(ThermalState.SERIOUS).toBe('serious');
      expect(ThermalState.CRITICAL).toBe('critical');
      expect(ThermalState.EMERGENCY).toBe('emergency');
      expect(ThermalState.SHUTDOWN).toBe('shutdown');
    });

    it('should define BatteryInfo interface', () => {
      const mockBatteryInfo: BatteryInfo = {
        level: 0.75,
        isCharging: false,
        chargingSource: 'AC',
        temperature: 32.5,
        voltage: 4.2,
        health: 'Good',
        timeRemaining: 14400, // 4 hours in seconds
        estimatedTimeToFull: null,
        powerSaveMode: false,
      };

      expect(mockBatteryInfo).toHaveProperty('level');
      expect(mockBatteryInfo).toHaveProperty('isCharging');
      expect(mockBatteryInfo).toHaveProperty('temperature');
      expect(mockBatteryInfo).toHaveProperty('timeRemaining');
    });

    it('should define MemoryInfo interface', () => {
      const mockMemoryInfo: MemoryInfo = {
        totalRAM: 8589934592, // 8GB
        availableRAM: 3221225472, // 3GB
        usedRAM: 5368709120, // 5GB
        freeRAM: 3221225472, // 3GB
        usagePercentage: 62.5,
        appMemoryUsage: 536870912, // 512MB
        systemMemoryUsage: 2147483648, // 2GB
        cacheMemoryUsage: 1073741824, // 1GB
        swapUsage: 0,
        memoryPressure: 'normal',
      };

      expect(mockMemoryInfo).toHaveProperty('totalRAM');
      expect(mockMemoryInfo).toHaveProperty('availableRAM');
      expect(mockMemoryInfo).toHaveProperty('usagePercentage');
      expect(mockMemoryInfo).toHaveProperty('memoryPressure');
    });

    it('should define DevicePerformanceProfile interface', () => {
      const mockProfile: DevicePerformanceProfile = {
        name: 'high_performance',
        displayName: 'High Performance',
        description: 'Maximum performance for video processing',
        cpuProfile: 'performance',
        gpuProfile: 'high',
        memoryProfile: 'optimized',
        thermalProfile: 'aggressive',
        powerProfile: 'performance',
        limits: {
          maxCpuUsage: 95,
          maxMemoryUsage: 85,
          maxThermalThreshold: ThermalState.SERIOUS,
          maxBatteryDrain: 50,
          minBatteryLevel: 20,
        },
        isActive: true,
        isCustom: false,
      };

      expect(mockProfile).toHaveProperty('name');
      expect(mockProfile).toHaveProperty('limits');
      expect(mockProfile).toHaveProperty('isActive');
    });
  });

  describe('getThermalState', () => {
    it('should return current thermal state', async () => {
      (mockDeviceMonitor.getThermalState as jest.Mock).mockResolvedValue(ThermalState.NOMINAL);

      const thermalState = await mockDeviceMonitor.getThermalState();
      
      expect(thermalState).toBe(ThermalState.NOMINAL);
      expect(mockDeviceMonitor.getThermalState).toHaveBeenCalled();
    });

    it('should handle critical thermal states', async () => {
      (mockDeviceMonitor.getThermalState as jest.Mock).mockResolvedValue(ThermalState.CRITICAL);

      const thermalState = await mockDeviceMonitor.getThermalState();
      
      expect(thermalState).toBe(ThermalState.CRITICAL);
    });
  });

  describe('startThermalMonitoring', () => {
    it('should start thermal monitoring with callback', async () => {
      const thermalCallback = jest.fn();
      const mockSession: MonitoringSession = {
        id: 'thermal-session-001',
        type: 'thermal',
        startTime: new Date(),
        isActive: true,
        config: {
          interval: 5000,
          enableAlerts: true,
          features: ['thermal'],
          thresholds: {
            thermal: ThermalState.SERIOUS,
          },
        },
      };

      (mockDeviceMonitor.startThermalMonitoring as jest.Mock).mockResolvedValue(mockSession);

      const session = await mockDeviceMonitor.startThermalMonitoring(thermalCallback, 5000);
      
      expect(session.id).toBe('thermal-session-001');
      expect(session.type).toBe('thermal');
      expect(session.isActive).toBe(true);
      expect(mockDeviceMonitor.startThermalMonitoring).toHaveBeenCalledWith(thermalCallback, 5000);
    });

    it('should handle thermal state changes', async () => {
      const thermalCallback = jest.fn();
      const mockEvent: DeviceEvent = {
        type: DeviceEventType.THERMAL_STATE_CHANGED,
        timestamp: new Date(),
        data: {
          previousState: ThermalState.NOMINAL,
          currentState: ThermalState.FAIR,
          temperature: 45.0,
        },
      };

      (mockDeviceMonitor.startThermalMonitoring as jest.Mock).mockImplementation(async (callback) => {
        // Simulate thermal state change
        callback(mockEvent);
        return { id: 'session-001', type: 'thermal', startTime: new Date(), isActive: true };
      });

      await mockDeviceMonitor.startThermalMonitoring(thermalCallback, 1000);
      
      expect(thermalCallback).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('getBatteryInfo', () => {
    it('should return comprehensive battery information', async () => {
      const expectedBatteryInfo: BatteryInfo = {
        level: 0.85,
        isCharging: true,
        chargingSource: 'USB',
        temperature: 28.5,
        voltage: 4.1,
        health: 'Good',
        timeRemaining: null,
        estimatedTimeToFull: 3600, // 1 hour
        powerSaveMode: false,
      };

      (mockDeviceMonitor.getBatteryInfo as jest.Mock).mockResolvedValue(expectedBatteryInfo);

      const batteryInfo = await mockDeviceMonitor.getBatteryInfo();
      
      expect(batteryInfo.level).toBe(0.85);
      expect(batteryInfo.isCharging).toBe(true);
      expect(batteryInfo.chargingSource).toBe('USB');
      expect(batteryInfo.estimatedTimeToFull).toBe(3600);
    });

    it('should handle low battery scenarios', async () => {
      const lowBatteryInfo: BatteryInfo = {
        level: 0.15,
        isCharging: false,
        chargingSource: null,
        temperature: 35.0,
        voltage: 3.7,
        health: 'Fair',
        timeRemaining: 1800, // 30 minutes
        estimatedTimeToFull: null,
        powerSaveMode: true,
      };

      (mockDeviceMonitor.getBatteryInfo as jest.Mock).mockResolvedValue(lowBatteryInfo);

      const batteryInfo = await mockDeviceMonitor.getBatteryInfo();
      
      expect(batteryInfo.level).toBe(0.15);
      expect(batteryInfo.powerSaveMode).toBe(true);
      expect(batteryInfo.timeRemaining).toBe(1800);
    });
  });

  describe('getMemoryInfo', () => {
    it('should return detailed memory information', async () => {
      const expectedMemoryInfo: MemoryInfo = {
        totalRAM: 8589934592, // 8GB
        availableRAM: 2147483648, // 2GB
        usedRAM: 6442450944, // 6GB
        freeRAM: 2147483648, // 2GB
        usagePercentage: 75.0,
        appMemoryUsage: 1073741824, // 1GB
        systemMemoryUsage: 3221225472, // 3GB
        cacheMemoryUsage: 2147483648, // 2GB
        swapUsage: 0,
        memoryPressure: 'moderate',
      };

      (mockDeviceMonitor.getMemoryInfo as jest.Mock).mockResolvedValue(expectedMemoryInfo);

      const memoryInfo = await mockDeviceMonitor.getMemoryInfo();
      
      expect(memoryInfo.totalRAM).toBe(8589934592);
      expect(memoryInfo.usagePercentage).toBe(75.0);
      expect(memoryInfo.memoryPressure).toBe('moderate');
      expect(memoryInfo.appMemoryUsage).toBe(1073741824);
    });

    it('should detect high memory pressure', async () => {
      const highPressureMemoryInfo: MemoryInfo = {
        totalRAM: 4294967296, // 4GB
        availableRAM: 268435456, // 256MB
        usedRAM: 4026531840, // 3.75GB
        freeRAM: 268435456, // 256MB
        usagePercentage: 93.75,
        appMemoryUsage: 536870912, // 512MB
        systemMemoryUsage: 2147483648, // 2GB
        cacheMemoryUsage: 1342177280, // 1.25GB
        swapUsage: 536870912, // 512MB
        memoryPressure: 'critical',
      };

      (mockDeviceMonitor.getMemoryInfo as jest.Mock).mockResolvedValue(highPressureMemoryInfo);

      const memoryInfo = await mockDeviceMonitor.getMemoryInfo();
      
      expect(memoryInfo.usagePercentage).toBeGreaterThan(90);
      expect(memoryInfo.memoryPressure).toBe('critical');
      expect(memoryInfo.swapUsage).toBeGreaterThan(0);
    });
  });

  describe('getCpuInfo', () => {
    it('should return CPU information and usage', async () => {
      const expectedCpuInfo: CpuInfo = {
        cores: 8,
        architecture: 'arm64',
        currentFrequency: 2400, // MHz
        maxFrequency: 3200, // MHz
        minFrequency: 800, // MHz
        usage: 65.5,
        usagePerCore: [70, 65, 60, 68, 55, 72, 48, 85],
        temperature: 55.5,
        governor: 'performance',
        features: ['neon', 'vfp', 'crypto'],
      };

      (mockDeviceMonitor.getCpuInfo as jest.Mock).mockResolvedValue(expectedCpuInfo);

      const cpuInfo = await mockDeviceMonitor.getCpuInfo();
      
      expect(cpuInfo.cores).toBe(8);
      expect(cpuInfo.architecture).toBe('arm64');
      expect(cpuInfo.usage).toBe(65.5);
      expect(cpuInfo.usagePerCore).toHaveLength(8);
      expect(cpuInfo.features).toContain('neon');
    });

    it('should handle CPU thermal throttling', async () => {
      const throttledCpuInfo: CpuInfo = {
        cores: 8,
        architecture: 'arm64',
        currentFrequency: 1600, // Throttled down
        maxFrequency: 3200,
        minFrequency: 800,
        usage: 95.0,
        usagePerCore: [100, 98, 95, 92, 90, 88, 85, 82],
        temperature: 75.0,
        governor: 'ondemand',
        features: ['neon', 'vfp'],
        isThrottled: true,
        throttleReason: 'thermal',
      };

      (mockDeviceMonitor.getCpuInfo as jest.Mock).mockResolvedValue(throttledCpuInfo);

      const cpuInfo = await mockDeviceMonitor.getCpuInfo();
      
      expect(cpuInfo.isThrottled).toBe(true);
      expect(cpuInfo.throttleReason).toBe('thermal');
      expect(cpuInfo.currentFrequency).toBeLessThan(cpuInfo.maxFrequency);
      expect(cpuInfo.temperature).toBeGreaterThan(70);
    });
  });

  describe('getPerformanceProfile', () => {
    it('should return current performance profile', async () => {
      const expectedProfile: DevicePerformanceProfile = {
        name: 'balanced',
        displayName: 'Balanced',
        description: 'Optimal balance between performance and battery life',
        cpuProfile: 'ondemand',
        gpuProfile: 'balanced',
        memoryProfile: 'normal',
        thermalProfile: 'moderate',
        powerProfile: 'balanced',
        limits: {
          maxCpuUsage: 80,
          maxMemoryUsage: 75,
          maxThermalThreshold: ThermalState.FAIR,
          maxBatteryDrain: 30,
          minBatteryLevel: 15,
        },
        isActive: true,
        isCustom: false,
      };

      (mockDeviceMonitor.getPerformanceProfile as jest.Mock).mockResolvedValue(expectedProfile);

      const profile = await mockDeviceMonitor.getPerformanceProfile();
      
      expect(profile.name).toBe('balanced');
      expect(profile.isActive).toBe(true);
      expect(profile.limits.maxCpuUsage).toBe(80);
      expect(profile.limits.maxThermalThreshold).toBe(ThermalState.FAIR);
    });

    it('should handle custom performance profiles', async () => {
      const customProfile: DevicePerformanceProfile = {
        name: 'video_processing_custom',
        displayName: 'Video Processing Custom',
        description: 'Custom profile optimized for video conversion tasks',
        cpuProfile: 'performance',
        gpuProfile: 'high',
        memoryProfile: 'aggressive',
        thermalProfile: 'conservative',
        powerProfile: 'high_performance',
        limits: {
          maxCpuUsage: 90,
          maxMemoryUsage: 80,
          maxThermalThreshold: ThermalState.SERIOUS,
          maxBatteryDrain: 60,
          minBatteryLevel: 25,
        },
        isActive: false,
        isCustom: true,
      };

      (mockDeviceMonitor.getPerformanceProfile as jest.Mock).mockResolvedValue(customProfile);

      const profile = await mockDeviceMonitor.getPerformanceProfile();
      
      expect(profile.isCustom).toBe(true);
      expect(profile.name).toBe('video_processing_custom');
      expect(profile.limits.maxCpuUsage).toBe(90);
    });
  });

  describe('setResourceThreshold', () => {
    it('should set resource thresholds for monitoring', async () => {
      const threshold: ResourceThreshold = {
        type: PerformanceLimitType.MEMORY_USAGE,
        value: 85,
        unit: 'percentage',
        action: 'alert',
        enabled: true,
      };

      (mockDeviceMonitor.setResourceThreshold as jest.Mock).mockResolvedValue(undefined);

      await mockDeviceMonitor.setResourceThreshold(PerformanceLimitType.MEMORY_USAGE, threshold);
      
      expect(mockDeviceMonitor.setResourceThreshold).toHaveBeenCalledWith(PerformanceLimitType.MEMORY_USAGE, threshold);
    });

    it('should handle multiple threshold types', async () => {
      const thresholds = [
        { type: PerformanceLimitType.CPU_USAGE, value: 90, unit: 'percentage', action: 'throttle', enabled: true },
        { type: PerformanceLimitType.BATTERY_LEVEL, value: 20, unit: 'percentage', action: 'pause', enabled: true },
        { type: PerformanceLimitType.THERMAL_STATE, value: ThermalState.SERIOUS, unit: 'state', action: 'stop', enabled: true },
      ];

      (mockDeviceMonitor.setResourceThreshold as jest.Mock).mockResolvedValue(undefined);

      for (const threshold of thresholds) {
        await mockDeviceMonitor.setResourceThreshold(threshold.type as PerformanceLimitType, threshold);
      }
      
      expect(mockDeviceMonitor.setResourceThreshold).toHaveBeenCalledTimes(3);
    });
  });

  describe('checkHardwareFeature', () => {
    it('should check hardware feature availability', async () => {
      const featureCheck: FeatureAvailability = {
        feature: HardwareFeature.HARDWARE_ENCODER,
        isAvailable: true,
        isEnabled: true,
        supportLevel: 'full',
        details: {
          codecs: ['h264', 'h265', 'vp8', 'vp9'],
          maxResolution: '4K',
          maxFrameRate: 60,
        },
      };

      (mockDeviceMonitor.checkHardwareFeature as jest.Mock).mockResolvedValue(featureCheck);

      const availability = await mockDeviceMonitor.checkHardwareFeature(HardwareFeature.HARDWARE_ENCODER);
      
      expect(availability.feature).toBe(HardwareFeature.HARDWARE_ENCODER);
      expect(availability.isAvailable).toBe(true);
      expect(availability.details?.['codecs']).toContain('h264');
    });

    it('should handle unsupported hardware features', async () => {
      const featureCheck: FeatureAvailability = {
        feature: HardwareFeature.NEURAL_PROCESSING_UNIT,
        isAvailable: false,
        isEnabled: false,
        supportLevel: 'none',
        reason: 'Hardware not present',
      };

      (mockDeviceMonitor.checkHardwareFeature as jest.Mock).mockResolvedValue(featureCheck);

      const availability = await mockDeviceMonitor.checkHardwareFeature(HardwareFeature.NEURAL_PROCESSING_UNIT);
      
      expect(availability.isAvailable).toBe(false);
      expect(availability.reason).toBe('Hardware not present');
    });
  });

  describe('getDeviceHealth', () => {
    it('should return overall device health status', async () => {
      const healthStatus: DeviceHealthStatus = {
        overallHealth: 'good',
        thermalHealth: 'excellent',
        batteryHealth: 'good',
        memoryHealth: 'fair',
        storageHealth: 'good',
        performanceHealth: 'good',
        score: 82,
        issues: [],
        recommendations: [
          'Consider clearing app cache to improve memory usage',
        ],
        lastChecked: new Date(),
      };

      (mockDeviceMonitor.getDeviceHealth as jest.Mock).mockResolvedValue(healthStatus);

      const health = await mockDeviceMonitor.getDeviceHealth();
      
      expect(health.overallHealth).toBe('good');
      expect(health.score).toBe(82);
      expect(health.issues).toHaveLength(0);
      expect(health.recommendations).toContain('Consider clearing app cache to improve memory usage');
    });

    it('should detect device health issues', async () => {
      const unhealthyStatus: DeviceHealthStatus = {
        overallHealth: 'poor',
        thermalHealth: 'poor',
        batteryHealth: 'fair',
        memoryHealth: 'critical',
        storageHealth: 'fair',
        performanceHealth: 'poor',
        score: 35,
        issues: [
          'Device overheating detected',
          'Memory usage critically high',
          'CPU performance throttled',
        ],
        recommendations: [
          'Stop intensive tasks and let device cool down',
          'Close unnecessary apps to free memory',
          'Consider restarting the device',
        ],
        lastChecked: new Date(),
      };

      (mockDeviceMonitor.getDeviceHealth as jest.Mock).mockResolvedValue(unhealthyStatus);

      const health = await mockDeviceMonitor.getDeviceHealth();
      
      expect(health.overallHealth).toBe('poor');
      expect(health.score).toBeLessThan(50);
      expect(health.issues).toContain('Device overheating detected');
      expect(health.recommendations).toContain('Stop intensive tasks and let device cool down');
    });
  });

  describe('startMonitoringSession', () => {
    it('should start comprehensive monitoring session', async () => {
      const config: MonitoringConfig = {
        interval: 5000,
        enableAlerts: true,
        thresholds: {
          cpu: 90,
          memory: 85,
          battery: 20,
          thermal: ThermalState.SERIOUS,
        },
        features: ['thermal', 'battery', 'memory', 'cpu'],
      };

      const expectedSession: MonitoringSession = {
        id: 'monitoring-session-001',
        type: 'comprehensive',
        startTime: new Date(),
        isActive: true,
        config,
        metrics: {
          samplesCollected: 0,
          alertsTriggered: 0,
          peakCpuUsage: 0,
          peakMemoryUsage: 0,
          thermalEvents: 0,
        },
      };

      (mockDeviceMonitor.startMonitoringSession as jest.Mock).mockResolvedValue(expectedSession);

      const session = await mockDeviceMonitor.startMonitoringSession(config);
      
      expect(session.id).toBe('monitoring-session-001');
      expect(session.type).toBe('comprehensive');
      expect(session.isActive).toBe(true);
      expect(session.config.interval).toBe(5000);
    });

    it('should handle monitoring session with custom configuration', async () => {
      const customConfig: MonitoringConfig = {
        interval: 1000, // High frequency monitoring
        enableAlerts: false,
        features: ['thermal', 'cpu'],
        customSettings: {
          logToFile: true,
          exportFormat: 'json',
          maxSamples: 1000,
        },
      };

      const session: MonitoringSession = {
        id: 'custom-session-001',
        type: 'custom',
        startTime: new Date(),
        isActive: true,
        config: customConfig,
        metrics: {
          samplesCollected: 0,
          alertsTriggered: 0,
          peakCpuUsage: 0,
          peakMemoryUsage: 0,
          thermalEvents: 0,
        },
      };

      (mockDeviceMonitor.startMonitoringSession as jest.Mock).mockResolvedValue(session);

      const result = await mockDeviceMonitor.startMonitoringSession(customConfig);
      
      expect(result.config.interval).toBe(1000);
      expect(result.config.enableAlerts).toBe(false);
      expect(result.config.customSettings!['logToFile']).toBe(true);
    });
  });

  describe('getOptimizationRecommendations', () => {
    it('should return optimization recommendations for video processing', async () => {
      const recommendations: OptimizationRecommendation[] = [
        {
          type: OptimizationType.PERFORMANCE,
          priority: 'high',
          title: 'Enable Hardware Acceleration',
          description: 'Use hardware encoder for better performance and lower power consumption',
          impact: 'Reduce encoding time by 60% and power usage by 40%',
          steps: [
            'Navigate to Settings > Video Processing',
            'Enable Hardware Acceleration',
            'Select optimal codec (H.264 hardware)',
          ],
          estimatedBenefit: {
            performanceGain: 60,
            powerSavings: 40,
            thermalReduction: 25,
          },
        },
        {
          type: OptimizationType.POWER,
          priority: 'medium',
          title: 'Optimize Memory Usage',
          description: 'Reduce memory footprint to improve device stability',
          impact: 'Free up 500MB of RAM and reduce memory pressure',
          steps: [
            'Clear app cache',
            'Close background apps',
            'Enable memory optimization',
          ],
          estimatedBenefit: {
            memoryFreed: 524288000, // 500MB
            stabilityImprovement: 30,
          },
        },
      ];

      (mockDeviceMonitor.getOptimizationRecommendations as jest.Mock).mockResolvedValue(recommendations);

      const results = await mockDeviceMonitor.getOptimizationRecommendations('video_processing');
      
      expect(results).toHaveLength(2);
      expect(results[0]!.type).toBe(OptimizationType.PERFORMANCE);
      expect(results[0]!.priority).toBe('high');
      expect(results[0]!.estimatedBenefit?.performanceGain).toBe(60);
      expect(results[1]!.type).toBe(OptimizationType.POWER);
    });

    it('should handle no optimization recommendations', async () => {
      (mockDeviceMonitor.getOptimizationRecommendations as jest.Mock).mockResolvedValue([]);

      const results = await mockDeviceMonitor.getOptimizationRecommendations('optimal_device');
      
      expect(results).toHaveLength(0);
    });
  });

  describe('takeResourceSnapshot', () => {
    it('should capture comprehensive resource usage snapshot', async () => {
      const snapshot: ResourceUsageSnapshot = {
        timestamp: new Date(),
        thermal: {
          state: ThermalState.FAIR,
          temperature: 45.5,
        },
        battery: {
          level: 0.65,
          isCharging: false,
          temperature: 32.0,
          powerSaveMode: false,
        },
        memory: {
          totalRAM: 8589934592,
          usedRAM: 5368709120,
          usagePercentage: 62.5,
          memoryPressure: 'normal',
        },
        cpu: {
          usage: 55.0,
          temperature: 50.5,
          frequency: 2400,
          cores: 8,
        },
        storage: {
          totalSpace: 137438953472,
          usedSpace: 68719476736,
          usagePercentage: 50.0,
        },
        network: {
          connectionType: 'wifi',
          signalStrength: 85,
          isMetered: false,
        },
        performanceScore: 78,
        healthScore: 82,
      };

      (mockDeviceMonitor.takeResourceSnapshot as jest.Mock).mockResolvedValue(snapshot);

      const result = await mockDeviceMonitor.takeResourceSnapshot();
      
      expect(result.thermal.state).toBe(ThermalState.FAIR);
      expect(result.battery.level).toBe(0.65);
      expect(result.memory.usagePercentage).toBe(62.5);
      expect(result.cpu.usage).toBe(55.0);
      expect(result.performanceScore).toBe(78);
    });
  });

  describe('Error Handling', () => {
    it('should define DeviceMonitorError class with proper types', () => {
      const error = new DeviceMonitorError(
        DeviceMonitorErrorType.MONITORING_UNAVAILABLE,
        'Thermal monitoring not available on this device',
        'THERMAL_NOT_SUPPORTED',
        { feature: 'thermal_monitoring' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(DeviceMonitorErrorType.MONITORING_UNAVAILABLE);
      expect(error.message).toBe('Thermal monitoring not available on this device');
      expect(error.code).toBe('THERMAL_NOT_SUPPORTED');
      expect(error.details).toEqual({ feature: 'thermal_monitoring' });
    });

    it('should handle different error types', () => {
      const errorTypes = [
        DeviceMonitorErrorType.PERMISSION_DENIED,
        DeviceMonitorErrorType.FEATURE_NOT_SUPPORTED,
        DeviceMonitorErrorType.MONITORING_UNAVAILABLE,
        DeviceMonitorErrorType.THRESHOLD_EXCEEDED,
        DeviceMonitorErrorType.SESSION_CONFLICT,
        DeviceMonitorErrorType.CONFIGURATION_INVALID,
        DeviceMonitorErrorType.UNKNOWN_ERROR,
      ];

      errorTypes.forEach(type => {
        const error = new DeviceMonitorError(type, `Test ${type}`, `TEST_${type}`);
        expect(error.type).toBe(type);
      });
    });
  });

  describe('Resource Alerts', () => {
    it('should handle resource alerts with proper severity', async () => {
      const mockAlert: ResourceAlert = {
        id: 'alert-001',
        type: ResourceAlertType.HIGH_CPU_USAGE,
        severity: ResourceAlertSeverity.WARNING,
        message: 'CPU usage has exceeded 85% for more than 30 seconds',
        timestamp: new Date(),
        value: 87.5,
        threshold: 85.0,
        recommendation: 'Consider reducing video processing quality or closing other apps',
        isActive: true,
      };

      (mockDeviceMonitor.getActiveAlerts as jest.Mock).mockResolvedValue([mockAlert]);

      const alerts = await mockDeviceMonitor.getActiveAlerts();
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0]!.type).toBe(ResourceAlertType.HIGH_CPU_USAGE);
      expect(alerts[0]!.severity).toBe(ResourceAlertSeverity.WARNING);
      expect(alerts[0]!.value).toBe(87.5);
      expect(alerts[0]!.isActive).toBe(true);
    });

    it('should handle critical alerts', async () => {
      const criticalAlert: ResourceAlert = {
        id: 'alert-002',
        type: ResourceAlertType.THERMAL_EMERGENCY,
        severity: ResourceAlertSeverity.CRITICAL,
        message: 'Device temperature critical - immediate action required',
        timestamp: new Date(),
        value: ThermalState.EMERGENCY,
        threshold: ThermalState.SERIOUS,
        recommendation: 'Stop all processing immediately and let device cool down',
        isActive: true,
      };

      (mockDeviceMonitor.getActiveAlerts as jest.Mock).mockResolvedValue([criticalAlert]);

      const alerts = await mockDeviceMonitor.getActiveAlerts();
      
      expect(alerts[0]!.severity).toBe(ResourceAlertSeverity.CRITICAL);
      expect(alerts[0]!.type).toBe(ResourceAlertType.THERMAL_EMERGENCY);
      expect(alerts[0]!.recommendation).toContain('Stop all processing immediately');
    });
  });
});