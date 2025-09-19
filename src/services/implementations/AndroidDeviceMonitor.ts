import DeviceInfo from 'react-native-device-info';
import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  DeviceMonitorService,
  ThermalState,
  PerformanceMetrics,
  DeviceCapabilityCheck,
  ResourceAlert,
  DeviceEventType,
  ResourceAlertType,
  ResourceAlertSeverity,
  PerformanceLimitType,
  OptimizationType,
} from '../DeviceMonitorService';

/**
 * Android Device Monitor implementation using React Native Device Info
 * Monitors device health, performance, and capabilities for video processing
 */
export class AndroidDeviceMonitor implements DeviceMonitorService {
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventCallbacks = new Map<string, (event: MonitoringEvent) => void>();
  private lastMetrics: DeviceMetrics | null = null;
  private config: {
    alertThresholds?: DeviceThresholds;
    monitoringInterval: number;
  } = {
    monitoringInterval: 5000,
  };

  constructor() {
    this.setupAppStateListener();
  }

  /**
   * Starts device monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringCycle();
    }, this.config.monitoringInterval);

    this.emitEvent(MonitoringEventType.MONITORING_STARTED, {
      timestamp: new Date(),
    });
  }

  /**
   * Stops device monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emitEvent(MonitoringEventType.MONITORING_STOPPED, {
      timestamp: new Date(),
    });
  }

  /**
   * Gets current thermal status
   */
  async getThermalStatus(): Promise<ThermalStatus> {
    try {
      // React Native Device Info doesn't provide direct thermal info
      // We'll use available power state information to estimate thermal state
      const powerState = await DeviceInfo.getPowerState();
      
      if (powerState.lowPowerMode) {
        return ThermalStatus.WARNING;
      }

      return ThermalStatus.NORMAL;
    } catch (error) {
      console.warn('Thermal status check failed:', error);
      return ThermalStatus.NORMAL;
    }
  }

  /**
   * Gets current battery status
   */
  async getBatteryStatus(): Promise<BatteryStatus> {
    try {
      const [batteryLevel, isCharging, powerState] = await Promise.all([
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.isBatteryCharging(),
        DeviceInfo.getPowerState(),
      ]);

      const alertLevel = this.getBatteryAlertLevel(batteryLevel * 100);

      return {
        level: batteryLevel * 100, // Convert to percentage
        isCharging,
        health: 'good', // Simplified - would need native implementation for actual health
        temperature: 0, // Not available in React Native Device Info
        voltage: 0, // Not available
        capacity: 0, // Not available
        chargingStatus: isCharging ? 'charging' : 'not_charging',
        powerSaveMode: powerState.lowPowerMode || false,
        alertLevel,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.SENSOR_ERROR,
        `Failed to get battery status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BATTERY_ERROR'
      );
    }
  }

  /**
   * Gets current memory status
   */
  async getMemoryStatus(): Promise<MemoryStatus> {
    try {
      const [totalMemory, usedMemory] = await Promise.all([
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getUsedMemory(),
      ]);

      const freeMemory = totalMemory - usedMemory;
      const usagePercentage = Math.round((usedMemory / totalMemory) * 100);
      const alertLevel = this.getMemoryAlertLevel(usagePercentage);

      return {
        totalRAM: totalMemory,
        usedRAM: usedMemory,
        freeRAM: freeMemory,
        usagePercentage,
        availableForApp: freeMemory * 0.8, // Estimate available for app usage
        alertLevel,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.SENSOR_ERROR,
        `Failed to get memory status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MEMORY_ERROR'
      );
    }
  }

  /**
   * Gets current storage status
   */
  async getStorageStatus(): Promise<StorageStatus> {
    try {
      const totalDiskCapacity = await DeviceInfo.getTotalDiskCapacity();
      const freeDiskStorage = await DeviceInfo.getFreeDiskStorage();
      const usedStorage = totalDiskCapacity - freeDiskStorage;
      const usagePercentage = Math.round((usedStorage / totalDiskCapacity) * 100);

      const alertLevel = this.getStorageAlertLevel(usagePercentage);

      return {
        totalSpace: totalDiskCapacity,
        usedSpace: usedStorage,
        freeSpace: freeDiskStorage,
        availableSpace: freeDiskStorage,
        usagePercentage,
        alertLevel,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.SENSOR_ERROR,
        `Failed to get storage status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      );
    }
  }

  /**
   * Gets current network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      // Basic network status - React Native Device Info has limited network info
      // In a real app, you might use @react-native-community/netinfo
      
      return {
        isConnected: true, // Assume connected for now
        connectionType: 'unknown',
        isWiFi: false,
        isCellular: false,
        isRoaming: false,
        signalStrength: 0,
        bandwidth: 0,
        timestamp: new Date(),
      };
    } catch (error) {
      console.warn('Network status check failed:', error);
      return {
        isConnected: false,
        connectionType: 'none',
        isWiFi: false,
        isCellular: false,
        isRoaming: false,
        signalStrength: 0,
        bandwidth: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets overall device health assessment
   */
  async getDeviceHealth(): Promise<DeviceHealth> {
    try {
      const [battery, thermal, memory, storage, network] = await Promise.all([
        this.getBatteryStatus(),
        this.getThermalStatus(),
        this.getMemoryStatus(),
        this.getStorageStatus(),
        this.getNetworkStatus(),
      ]);

      // Calculate overall health score (0-100)
      let healthScore = 100;
      const alerts: string[] = [];
      const warnings: string[] = [];

      // Battery health impact
      if (battery.alertLevel === AlertLevel.CRITICAL) {
        healthScore -= 30;
        alerts.push('Critical battery level');
      } else if (battery.alertLevel === AlertLevel.WARNING) {
        healthScore -= 15;
        warnings.push('Low battery level');
      }

      // Thermal health impact
      if (thermal === ThermalStatus.CRITICAL) {
        healthScore -= 40;
        alerts.push('Device overheating');
      } else if (thermal === ThermalStatus.WARNING) {
        healthScore -= 20;
        warnings.push('Device running hot');
      }

      // Memory health impact
      if (memory.alertLevel === AlertLevel.CRITICAL) {
        healthScore -= 25;
        alerts.push('Critical memory usage');
      } else if (memory.alertLevel === AlertLevel.WARNING) {
        healthScore -= 12;
        warnings.push('High memory usage');
      }

      // Storage health impact
      if (storage.alertLevel === AlertLevel.CRITICAL) {
        healthScore -= 20;
        alerts.push('Critical storage usage');
      } else if (storage.alertLevel === AlertLevel.WARNING) {
        healthScore -= 10;
        warnings.push('High storage usage');
      }

      healthScore = Math.max(0, healthScore);

      let overallStatus: 'excellent' | 'good' | 'warning' | 'critical';
      if (healthScore >= 90) overallStatus = 'excellent';
      else if (healthScore >= 70) overallStatus = 'good';
      else if (healthScore >= 40) overallStatus = 'warning';
      else overallStatus = 'critical';

      const canProcessVideo = healthScore >= 40 && 
                             battery.level > 15 && 
                             thermal !== ThermalStatus.CRITICAL &&
                             memory.usagePercentage < 95;

      return {
        overallStatus,
        healthScore,
        canProcessVideo,
        battery,
        thermal,
        memory,
        storage,
        network,
        alerts,
        warnings,
        recommendations: this.generateRecommendations(battery, thermal, memory, storage),
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.ASSESSMENT_FAILED,
        `Failed to assess device health: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HEALTH_ASSESSMENT_FAILED'
      );
    }
  }

  /**
   * Gets device capabilities for video processing
   */
  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    try {
      const [
        deviceName,
        systemVersion,
        apiLevel,
        totalMemory,
        maxMemory,
        manufacturer,
        brand,
        model,
        uniqueId,
        isEmulator,
        isTablet,
        hasNotch,
        totalDiskCapacity,
        freeDiskStorage,
      ] = await Promise.all([
        DeviceInfo.getDeviceName(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getApiLevel(),
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getMaxMemory(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getUniqueId(),
        DeviceInfo.isEmulator(),
        DeviceInfo.isTablet(),
        DeviceInfo.hasNotch(),
        DeviceInfo.getTotalDiskCapacity(),
        DeviceInfo.getFreeDiskStorage(),
      ]);

      // Calculate processing capability score
      const memoryScore = Math.min(100, (totalMemory / (4 * 1024 * 1024 * 1024)) * 100); // 4GB baseline
      const storageScore = Math.min(100, (totalDiskCapacity / (32 * 1024 * 1024 * 1024)) * 100); // 32GB baseline
      const apiScore = Math.min(100, Math.max(0, (apiLevel - 21) / 9 * 100)); // API 21-30 range
      
      const processingScore = Math.round((memoryScore * 0.4 + storageScore * 0.3 + apiScore * 0.3));

      const capabilities: DeviceCapabilities = {
        device: {
          id: uniqueId,
          name: deviceName,
          manufacturer,
          model: `${brand} ${model}`,
          platform: 'android',
          osVersion: systemVersion,
          apiLevel,
          isEmulator,
          isTablet,
          screenDensity: 0, // Would need additional module
          screenResolution: { width: 0, height: 0 }, // Would need additional module
          hasNotch,
        },
        hardware: {
          cpuArchitecture: 'unknown', // Would need additional module
          cpuCores: 0, // Would need additional module
          cpuFrequency: 0, // Would need additional module
          ramTotal: totalMemory,
          ramAvailable: totalMemory,
          storageTotal: totalDiskCapacity,
          storageAvailable: freeDiskStorage,
          hasGpuAcceleration: !isEmulator, // Assume physical devices have GPU
          gpuModel: 'unknown',
          supportsVideoProcessing: true,
          supportsHardwareEncoding: !isEmulator,
          maxVideoResolution: isTablet ? '4K' : '1080p',
          supportedCodecs: ['h264', 'h265', 'vp8', 'vp9'],
          supportedFormats: ['mp4', 'mov', 'avi', 'mkv'],
        },
        performance: {
          benchmarkScore: 0, // Would need benchmarking
          videoProcessingScore: processingScore,
          encodingCapability: processingScore > 50 ? 'high' : processingScore > 30 ? 'medium' : 'low',
          maxConcurrentJobs: Math.max(1, Math.floor(processingScore / 25)),
          estimatedProcessingSpeed: processingScore / 50, // Relative to real-time
          powerEfficiency: isEmulator ? 'low' : 'medium',
          thermalThrottling: processingScore < 40,
        },
        battery: {
          level: 100, // Will be updated by monitoring
          isCharging: false,
          health: 'good',
          capacity: 0, // Not available
          voltage: 0, // Not available
          temperature: 0, // Not available
          estimatedLifetime: 0, // Not available
          supportsWirelessCharging: false, // Not easily detectable
          supportsFastCharging: false, // Not easily detectable
        },
        network: {
          hasWifi: true, // Assume available
          hasCellular: !isTablet, // Assume phones have cellular
          hasBluetooth: true, // Assume available
          hasNfc: false, // Not easily detectable
          maxDownloadSpeed: 0, // Would need testing
          maxUploadSpeed: 0, // Would need testing
          latency: 0, // Would need testing
        },
        sensors: {
          hasAccelerometer: true, // Assume available
          hasGyroscope: true, // Assume available
          hasMagnetometer: false, // Not easily detectable
          hasProximitySensor: !isTablet, // Assume phones have it
          hasLightSensor: true, // Assume available
          hasTemperatureSensor: false, // Rare on mobile
          hasPressureSensor: false, // Not common
        },
        features: {
          supportsBackgroundProcessing: true,
          supportsNotifications: true,
          supportsFileSharing: true,
          supportsCloudSync: true,
          supportsVideoPreview: true,
          supportsBatchProcessing: processingScore > 40,
          supportsRealTimeProcessing: processingScore > 60,
          supportsCustomPresets: true,
          supportsAdvancedSettings: processingScore > 30,
        },
      };

      return capabilities;
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.CAPABILITY_DETECTION_FAILED,
        `Failed to detect device capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CAPABILITY_DETECTION_FAILED'
      );
    }
  }

  /**
   * Gets current device metrics
   */
  async getDeviceMetrics(): Promise<DeviceMetrics> {
    try {
      const [battery, memory, storage] = await Promise.all([
        this.getBatteryStatus(),
        this.getMemoryStatus(),
        this.getStorageStatus(),
      ]);

      const thermal = await this.getThermalStatus();

      return {
        battery,
        memory,
        storage,
        thermal,
        cpu: {
          usage: 0, // Would need platform-specific implementation
          frequency: 0,
          temperature: 0,
          cores: 0,
          processes: 0,
        },
        gpu: {
          usage: 0, // Would need platform-specific implementation
          memory: 0,
          temperature: 0,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.METRICS_COLLECTION_FAILED,
        `Failed to collect device metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'METRICS_COLLECTION_FAILED'
      );
    }
  }

  /**
   * Gets performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const metrics = await this.getDeviceMetrics();
      
      // Calculate performance indicators
      const powerScore = 100 - (100 - metrics.battery.level) * 0.5; // Battery impact
      const memoryScore = 100 - metrics.memory.usagePercentage; // Memory availability
      const storageScore = 100 - metrics.storage.usagePercentage; // Storage availability
      const thermalScore = this.getThermalScore(metrics.thermal);

      const overallPerformance = Math.round((powerScore + memoryScore + storageScore + thermalScore) / 4);

      return {
        overall: overallPerformance,
        cpu: {
          score: Math.round((memoryScore + thermalScore) / 2),
          efficiency: thermalScore > 80 ? 'high' : thermalScore > 60 ? 'medium' : 'low',
          bottlenecks: this.identifyBottlenecks(metrics),
        },
        memory: {
          score: memoryScore,
          efficiency: memoryScore > 80 ? 'high' : memoryScore > 60 ? 'medium' : 'low',
          fragmentation: 0, // Not easily detectable
        },
        storage: {
          score: storageScore,
          readSpeed: 0, // Would need benchmarking
          writeSpeed: 0, // Would need benchmarking
        },
        network: {
          score: 75, // Default reasonable score
          latency: 50, // Estimated
          throughput: 0, // Would need testing
        },
        recommendations: this.generatePerformanceRecommendations(metrics),
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.PERFORMANCE_ANALYSIS_FAILED,
        `Failed to analyze performance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PERFORMANCE_ANALYSIS_FAILED'
      );
    }
  }

  /**
   * Gets system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const [
        systemName,
        systemVersion,
        buildNumber,
        bundleId,
        version,
        buildVersion,
        deviceName,
        manufacturer,
        brand,
        model,
        uniqueId,
        androidId,
        apiLevel,
        bootloader,
        fingerprint,
        hardware,
        product,
        tags,
        type,
        baseOs,
        previewSdkInt,
        securityPatch,
        codename,
        incremental,
      ] = await Promise.all([
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getBundleId(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getDeviceName(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getUniqueId(),
        Platform.OS === 'android' ? DeviceInfo.getAndroidId() : Promise.resolve(''),
        DeviceInfo.getApiLevel(),
        Platform.OS === 'android' ? DeviceInfo.getBootloader() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getFingerprint() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getHardware() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getProduct() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getTags() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getType() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getBaseOs() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getPreviewSdkInt() : Promise.resolve(0),
        Platform.OS === 'android' ? DeviceInfo.getSecurityPatch() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getCodename() : Promise.resolve(''),
        Platform.OS === 'android' ? DeviceInfo.getIncremental() : Promise.resolve(''),
      ]);

      return {
        platform: Platform.OS,
        osName: systemName,
        osVersion: systemVersion,
        osBuild: buildNumber,
        apiLevel,
        deviceName,
        manufacturer,
        brand,
        model,
        hardware: hardware || 'unknown',
        bootloader: bootloader || 'unknown',
        fingerprint: fingerprint || 'unknown',
        uptime: 0, // Would need platform-specific implementation
        kernelVersion: 'unknown', // Would need platform-specific implementation
        buildInfo: {
          product: product || 'unknown',
          tags: tags || 'unknown',
          type: type || 'unknown',
          baseOs: baseOs || 'unknown',
          securityPatch: securityPatch || 'unknown',
          codename: codename || 'unknown',
          incremental: incremental || 'unknown',
          previewSdkInt,
        },
        identifiers: {
          uniqueId,
          androidId: androidId || '',
          serialNumber: 'unknown', // Not available for security reasons
        },
        app: {
          bundleId,
          version,
          buildNumber: buildVersion,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      throw new MonitoringError(
        MonitoringErrorType.SYSTEM_INFO_FAILED,
        `Failed to get system info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SYSTEM_INFO_FAILED'
      );
    }
  }

  /**
   * Sets device monitoring thresholds
   */
  async setThresholds(thresholds: Partial<DeviceThresholds>): Promise<void> {
    this.config.alertThresholds = { ...this.config.alertThresholds, ...thresholds };
    
    this.emitEvent(MonitoringEventType.THRESHOLDS_UPDATED, {
      thresholds: this.config.alertThresholds,
      timestamp: new Date(),
    });
  }

  /**
   * Registers callback for monitoring events
   */
  onEvent(eventType: MonitoringEventType, callback: (event: MonitoringEvent) => void): string {
    const id = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.eventCallbacks.set(id, callback);
    return id;
  }

  /**
   * Unregisters event callback
   */
  offEvent(callbackId: string): void {
    this.eventCallbacks.delete(callbackId);
  }

  /**
   * Checks if device is suitable for video processing
   */
  async isSuitableForProcessing(): Promise<boolean> {
    try {
      const health = await this.getDeviceHealth();
      return health.canProcessVideo;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private async performMonitoringCycle(): Promise<void> {
    try {
      const metrics = await this.getDeviceMetrics();
      
      // Check for threshold violations
      this.checkThresholds(metrics);
      
      // Store last metrics for comparison
      this.lastMetrics = metrics;
      
      // Emit metrics update event
      this.emitEvent(MonitoringEventType.METRICS_UPDATED, {
        metrics,
        timestamp: new Date(),
      });
    } catch (error) {
      this.emitEvent(MonitoringEventType.ERROR_OCCURRED, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }
  }

  private checkThresholds(metrics: DeviceMetrics): void {
    const thresholds = this.config.alertThresholds;
    
    if (!thresholds) return;

    // Battery threshold
    if (thresholds.batteryLevel && metrics.battery.level <= thresholds.batteryLevel) {
      this.emitEvent(MonitoringEventType.THRESHOLD_EXCEEDED, {
        type: 'battery',
        value: metrics.battery.level,
        threshold: thresholds.batteryLevel,
        severity: metrics.battery.level <= 10 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        timestamp: new Date(),
      });
    }

    // Memory threshold
    if (thresholds.memoryUsage && metrics.memory.usagePercentage >= thresholds.memoryUsage) {
      this.emitEvent(MonitoringEventType.THRESHOLD_EXCEEDED, {
        type: 'memory',
        value: metrics.memory.usagePercentage,
        threshold: thresholds.memoryUsage,
        severity: metrics.memory.usagePercentage >= 95 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        timestamp: new Date(),
      });
    }

    // Storage threshold
    if (thresholds.storageUsage && metrics.storage.usagePercentage >= thresholds.storageUsage) {
      this.emitEvent(MonitoringEventType.THRESHOLD_EXCEEDED, {
        type: 'storage',
        value: metrics.storage.usagePercentage,
        threshold: thresholds.storageUsage,
        severity: metrics.storage.usagePercentage >= 98 ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        timestamp: new Date(),
      });
    }

    // Thermal threshold
    if (thresholds.thermalState && this.compareThermalStatus(metrics.thermal, thresholds.thermalState) >= 0) {
      this.emitEvent(MonitoringEventType.THRESHOLD_EXCEEDED, {
        type: 'thermal',
        value: metrics.thermal,
        threshold: thresholds.thermalState,
        severity: metrics.thermal === ThermalStatus.CRITICAL ? AlertLevel.CRITICAL : AlertLevel.WARNING,
        timestamp: new Date(),
      });
    }
  }

  private emitEvent(type: MonitoringEventType, data: any): void {
    const event: MonitoringEvent = {
      type,
      timestamp: new Date(),
      data,
    };

    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.warn('Event callback error:', error);
      }
    });
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.emitEvent(MonitoringEventType.APP_STATE_CHANGED, {
        state: nextAppState,
        timestamp: new Date(),
      });

      // Pause monitoring when app goes to background
      if (nextAppState === 'background' && this.isMonitoring) {
        this.stopMonitoring();
      }
    });
  }

  private getBatteryAlertLevel(level: number): AlertLevel {
    if (level <= 10) return AlertLevel.CRITICAL;
    if (level <= 20) return AlertLevel.WARNING;
    if (level <= 30) return AlertLevel.INFO;
    return AlertLevel.NORMAL;
  }

  private getMemoryAlertLevel(usage: number): AlertLevel {
    if (usage >= 95) return AlertLevel.CRITICAL;
    if (usage >= 85) return AlertLevel.WARNING;
    if (usage >= 75) return AlertLevel.INFO;
    return AlertLevel.NORMAL;
  }

  private getStorageAlertLevel(usage: number): AlertLevel {
    if (usage >= 98) return AlertLevel.CRITICAL;
    if (usage >= 90) return AlertLevel.WARNING;
    if (usage >= 80) return AlertLevel.INFO;
    return AlertLevel.NORMAL;
  }

  private getThermalScore(thermal: ThermalStatus): number {
    switch (thermal) {
      case ThermalStatus.NORMAL: return 100;
      case ThermalStatus.WARNING: return 70;
      case ThermalStatus.CRITICAL: return 30;
      default: return 85;
    }
  }

  private compareThermalStatus(current: ThermalStatus, threshold: ThermalStatus): number {
    const order = [ThermalStatus.NORMAL, ThermalStatus.WARNING, ThermalStatus.CRITICAL];
    return order.indexOf(current) - order.indexOf(threshold);
  }

  private identifyBottlenecks(metrics: DeviceMetrics): string[] {
    const bottlenecks: string[] = [];
    
    if (metrics.memory.usagePercentage > 85) {
      bottlenecks.push('High memory usage');
    }
    
    if (metrics.storage.usagePercentage > 90) {
      bottlenecks.push('Low storage space');
    }
    
    if (metrics.thermal === ThermalStatus.WARNING || metrics.thermal === ThermalStatus.CRITICAL) {
      bottlenecks.push('Thermal throttling');
    }
    
    if (metrics.battery.level < 20) {
      bottlenecks.push('Low battery');
    }
    
    return bottlenecks;
  }

  private generateRecommendations(
    battery: BatteryStatus,
    thermal: ThermalStatus,
    memory: MemoryStatus,
    storage: StorageStatus
  ): string[] {
    const recommendations: string[] = [];
    
    if (battery.level < 20) {
      recommendations.push('Connect device to charger before processing');
    }
    
    if (thermal === ThermalStatus.WARNING) {
      recommendations.push('Allow device to cool down before processing');
    }
    
    if (memory.usagePercentage > 85) {
      recommendations.push('Close other apps to free up memory');
    }
    
    if (storage.usagePercentage > 90) {
      recommendations.push('Free up storage space for optimal performance');
    }
    
    return recommendations;
  }

  private generatePerformanceRecommendations(metrics: DeviceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.memory.usagePercentage > 80) {
      recommendations.push('Reduce video quality settings to lower memory usage');
    }
    
    if (metrics.thermal === ThermalStatus.WARNING) {
      recommendations.push('Use lower processing intensity to prevent overheating');
    }
    
    if (metrics.battery.level < 30) {
      recommendations.push('Enable power saving mode for longer processing sessions');
    }
    
    if (metrics.storage.usagePercentage > 85) {
      recommendations.push('Use temporary storage for processing files');
    }
    
    return recommendations;
  }
}