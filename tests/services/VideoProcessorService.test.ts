import {
  VideoProcessorService,
  ConversionSession,
  ConversionProgress,
  ConversionStatistics,
  ProcessingOptions,
  ConversionEventType,
  ConversionEvent,
  VideoAnalysisResult,
  ConversionPreset,
  QualityProfile,
  ProcessingError,
  ProcessingErrorType,
  SessionState
} from '../../src/services/VideoProcessorService';
import {
  ConversionRequest,
  ConversionResult,
  VideoFile,
  VideoFormat,
  VideoQuality,
  OutputFormat,
  ConversionStatus
} from '../../src/types/models';
import { DeviceCapabilities } from '../../src/types/models';

describe('VideoProcessorService Contract', () => {
  let mockVideoProcessor: VideoProcessorService;
  let mockDeviceCapabilities: DeviceCapabilities;
  let mockVideoFile: VideoFile;
  let mockConversionRequest: ConversionRequest;

  beforeEach(() => {
    // Mock device capabilities
    mockDeviceCapabilities = {
      id: 'test-device-001',
      deviceModel: 'Test Device',
      androidVersion: '12',
      apiLevel: 31,
      architecture: 'arm64-v8a',
      lastUpdated: new Date(),
      battery: {
        level: 0.90,
        isCharging: false,
        health: 'good',
        temperature: 25,
        voltage: 4.2,
        capacity: 4000,
      },
      memory: {
        totalRam: 8589934592, // 8GB
        availableRam: 4294967296, // 4GB
        usedRam: 4294967296, // 4GB
        totalStorage: 137438953472, // 128GB
        availableStorage: 68719476736, // 64GB
        usedStorage: 68719476736, // 64GB
        isLowMemory: false,
      },
      thermal: {
        state: 'normal' as any,
        temperature: 30,
        throttleLevel: 0,
        maxSafeTemperature: 85,
      },
      processor: {
        cores: 8,
        maxFrequency: 2400,
        currentFrequency: 1800,
        usage: 25,
        architecture: 'arm64-v8a',
      },
      performance: {
        benchmark: 85,
        videoProcessingScore: 80,
        thermalEfficiency: 75,
        batteryEfficiency: 85,
      }
    };

    // Mock video file
    mockVideoFile = {
      id: 'test-video-001',
      name: 'sample_video.mp4',
      path: '/storage/emulated/0/DCIM/Camera/sample_video.mp4',
      size: 52428800, // 50MB
      mimeType: 'video/mp4',
      format: VideoFormat.MP4,
      createdAt: new Date('2025-09-17T10:00:00Z'),
      modifiedAt: new Date('2025-09-17T10:00:00Z'),
      metadata: {
        duration: 30000, // 30 seconds
        width: 1920,
        height: 1080,
        frameRate: 30.0,
        bitrate: 8000000, // 8 Mbps
        codec: 'h264',
        codecName: 'H.264',
        audioCodec: 'aac',
        audioBitrate: 128000,
        audioSampleRate: 44100,
        audioChannels: 2,
      },
    };

    // Mock conversion request
    mockConversionRequest = {
      id: 'test-request-001',
      inputFile: mockVideoFile,
      outputFormat: OutputFormat.MP4,
      targetQuality: VideoQuality.HD,
      outputPath: '/storage/emulated/0/VideoConverter/output.mp4',
      createdAt: new Date(),
    };

    // Create mock implementation
    mockVideoProcessor = {
      analyzeVideo: jest.fn(),
      createSession: jest.fn(),
      startConversion: jest.fn(),
      pauseConversion: jest.fn(),
      resumeConversion: jest.fn(),
      cancelConversion: jest.fn(),
      getSessionStatus: jest.fn(),
      getSupportedFormats: jest.fn(),
      getQualityProfiles: jest.fn(),
      getConversionPresets: jest.fn(),
      validateRequest: jest.fn(),
      estimateProcessingTime: jest.fn(),
      estimateOutputSize: jest.fn(),
      cleanup: jest.fn(),
    };
  });

  describe('Interface Definition', () => {
    it('should define VideoProcessorService interface with all required methods', () => {
      expect(mockVideoProcessor).toHaveProperty('analyzeVideo');
      expect(mockVideoProcessor).toHaveProperty('createSession');
      expect(mockVideoProcessor).toHaveProperty('startConversion');
      expect(mockVideoProcessor).toHaveProperty('pauseConversion');
      expect(mockVideoProcessor).toHaveProperty('resumeConversion');
      expect(mockVideoProcessor).toHaveProperty('cancelConversion');
      expect(mockVideoProcessor).toHaveProperty('getSessionStatus');
      expect(mockVideoProcessor).toHaveProperty('getSupportedFormats');
      expect(mockVideoProcessor).toHaveProperty('getQualityProfiles');
      expect(mockVideoProcessor).toHaveProperty('getConversionPresets');
      expect(mockVideoProcessor).toHaveProperty('validateRequest');
      expect(mockVideoProcessor).toHaveProperty('estimateProcessingTime');
      expect(mockVideoProcessor).toHaveProperty('estimateOutputSize');
      expect(mockVideoProcessor).toHaveProperty('cleanup');
    });

    it('should define ConversionSession interface', () => {
      const mockSession: ConversionSession = {
        id: 'session-001',
        request: mockConversionRequest,
        state: SessionState.CREATED,
        createdAt: new Date(),
        progress: {
          percentage: 0,
          processedDuration: 0,
          totalDuration: 30000,
          currentPhase: 'initializing',
          estimatedTimeRemaining: 60000,
          processingSpeed: 0,
        },
        statistics: {
          startTime: new Date(),
          bytesProcessed: 0,
          framesProcessed: 0,
          averageSpeed: 0,
          peakMemoryUsage: 0,
          cpuUsage: 0,
        },
      };

      expect(mockSession).toHaveProperty('id');
      expect(mockSession).toHaveProperty('request');
      expect(mockSession).toHaveProperty('state');
      expect(mockSession).toHaveProperty('progress');
      expect(mockSession).toHaveProperty('statistics');
    });

    it('should define ProcessingOptions interface', () => {
      const mockOptions: ProcessingOptions = {
        deviceCapabilities: mockDeviceCapabilities,
        maxConcurrentSessions: 2,
        enableHardwareAcceleration: true,
        useGpuAcceleration: false,
        qualityPreference: 'balanced',
        powerSavingMode: false,
        thermalMonitoring: true,
        progressUpdateInterval: 1000,
        tempDirectory: '/data/data/com.app/cache/video_processing',
      };

      expect(mockOptions).toHaveProperty('deviceCapabilities');
      expect(mockOptions).toHaveProperty('maxConcurrentSessions');
      expect(mockOptions).toHaveProperty('enableHardwareAcceleration');
      expect(mockOptions).toHaveProperty('progressUpdateInterval');
    });
  });

  describe('analyzeVideo', () => {
    it('should analyze video file and return metadata', async () => {
      const expectedAnalysis: VideoAnalysisResult = {
        isValid: true,
        metadata: mockVideoFile.metadata,
        supportedFormats: [OutputFormat.MP4, OutputFormat.MOV],
        recommendedQuality: VideoQuality.HD,
        estimatedProcessingTime: 45000, // 45 seconds
        complexity: 'medium',
        issues: [],
      };

      (mockVideoProcessor.analyzeVideo as jest.Mock).mockResolvedValue(expectedAnalysis);

      const result = await mockVideoProcessor.analyzeVideo(mockVideoFile.path);
      
      expect(mockVideoProcessor.analyzeVideo).toHaveBeenCalledWith(mockVideoFile.path);
      expect(result).toEqual(expectedAnalysis);
      expect(result.isValid).toBe(true);
      expect(result.metadata.duration).toBe(30000);
    });

    it('should detect invalid video files', async () => {
      const invalidAnalysis: VideoAnalysisResult = {
        isValid: false,
        metadata: null,
        supportedFormats: [],
        recommendedQuality: VideoQuality.LOW,
        estimatedProcessingTime: 0,
        complexity: 'unknown',
        issues: ['Unsupported codec', 'Corrupted file header'],
      };

      (mockVideoProcessor.analyzeVideo as jest.Mock).mockResolvedValue(invalidAnalysis);

      const result = await mockVideoProcessor.analyzeVideo('/invalid/path.mp4');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Unsupported codec');
      expect(result.issues).toContain('Corrupted file header');
    });

    it('should handle analysis errors gracefully', async () => {
      const error = new Error('File not found');
      (mockVideoProcessor.analyzeVideo as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.analyzeVideo('/nonexistent.mp4')).rejects.toThrow('File not found');
    });
  });

  describe('createSession', () => {
    it('should create a new conversion session', async () => {
      const expectedSession: ConversionSession = {
        id: 'session-001',
        request: mockConversionRequest,
        state: SessionState.CREATED,
        createdAt: new Date(),
        progress: {
          percentage: 0,
          processedDuration: 0,
          totalDuration: 30000,
          currentPhase: 'initializing',
          estimatedTimeRemaining: 60000,
          processingSpeed: 0,
        },
        statistics: {
          startTime: new Date(),
          bytesProcessed: 0,
          framesProcessed: 0,
          averageSpeed: 0,
          peakMemoryUsage: 0,
          cpuUsage: 0,
        },
      };

      (mockVideoProcessor.createSession as jest.Mock).mockResolvedValue(expectedSession);

      const session = await mockVideoProcessor.createSession(mockConversionRequest);
      
      expect(mockVideoProcessor.createSession).toHaveBeenCalledWith(mockConversionRequest);
      expect(session.id).toBe('session-001');
      expect(session.state).toBe(SessionState.CREATED);
      expect(session.request).toEqual(mockConversionRequest);
    });

    it('should validate conversion request before creating session', async () => {
      const invalidRequest = { ...mockConversionRequest, videoFile: null };
      const error = new ProcessingError(
        ProcessingErrorType.VALIDATION_ERROR,
        'Invalid video file',
        'VIDEO_FILE_REQUIRED'
      );

      (mockVideoProcessor.createSession as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.createSession(invalidRequest as any)).rejects.toThrow('Invalid video file');
    });

    it('should assign unique session IDs', async () => {
      const session1: ConversionSession = {
        id: 'session-001',
        request: mockConversionRequest,
        state: SessionState.CREATED,
        createdAt: new Date(),
        progress: {
          percentage: 0,
          processedDuration: 0,
          totalDuration: 30000,
          currentPhase: 'initializing',
          estimatedTimeRemaining: 60000,
          processingSpeed: 0,
        },
        statistics: {
          startTime: new Date(),
          bytesProcessed: 0,
          framesProcessed: 0,
          averageSpeed: 0,
          peakMemoryUsage: 0,
          cpuUsage: 0,
        },
      };

      const session2: ConversionSession = { ...session1, id: 'session-002' };

      (mockVideoProcessor.createSession as jest.Mock)
        .mockResolvedValueOnce(session1)
        .mockResolvedValueOnce(session2);

      const firstSession = await mockVideoProcessor.createSession(mockConversionRequest);
      const secondSession = await mockVideoProcessor.createSession(mockConversionRequest);
      
      expect(firstSession.id).not.toBe(secondSession.id);
    });
  });

  describe('startConversion', () => {
    it('should start conversion for a valid session', async () => {
      const sessionId = 'session-001';
      const processingOptions: ProcessingOptions = {
        deviceCapabilities: mockDeviceCapabilities,
        maxConcurrentSessions: 2,
        enableHardwareAcceleration: true,
        useGpuAcceleration: false,
        qualityPreference: 'balanced',
        powerSavingMode: false,
        thermalMonitoring: true,
        progressUpdateInterval: 1000,
        tempDirectory: '/tmp',
      };

      (mockVideoProcessor.startConversion as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.startConversion(sessionId, processingOptions);
      
      expect(mockVideoProcessor.startConversion).toHaveBeenCalledWith(sessionId, processingOptions);
    });

    it('should emit progress events during conversion', async () => {
      const sessionId = 'session-001';
      const progressEvents: ConversionEvent[] = [
        {
          type: ConversionEventType.PROGRESS_UPDATE,
          sessionId,
          timestamp: new Date(),
          data: {
            percentage: 25,
            processedDuration: 7500,
            totalDuration: 30000,
            currentPhase: 'encoding',
            estimatedTimeRemaining: 45000,
            processingSpeed: 1.2,
          },
        },
        {
          type: ConversionEventType.PROGRESS_UPDATE,
          sessionId,
          timestamp: new Date(),
          data: {
            percentage: 50,
            processedDuration: 15000,
            totalDuration: 30000,
            currentPhase: 'encoding',
            estimatedTimeRemaining: 30000,
            processingSpeed: 1.5,
          },
        },
      ];

      // Mock the service to call event listeners
      const mockEventListener = jest.fn();
      const processingOptions: ProcessingOptions = {
        deviceCapabilities: mockDeviceCapabilities,
        maxConcurrentSessions: 1,
        enableHardwareAcceleration: true,
        useGpuAcceleration: false,
        qualityPreference: 'quality',
        powerSavingMode: false,
        thermalMonitoring: true,
        progressUpdateInterval: 500,
        tempDirectory: '/tmp',
        onProgress: mockEventListener,
      };

      (mockVideoProcessor.startConversion as jest.Mock).mockImplementation(async (sessionId, options) => {
        // Simulate progress events
        if (options.onProgress) {
          progressEvents.forEach(event => options.onProgress(event));
        }
      });

      await mockVideoProcessor.startConversion(sessionId, processingOptions);
      
      expect(mockEventListener).toHaveBeenCalledTimes(2);
      expect(mockEventListener).toHaveBeenCalledWith(progressEvents[0]);
      expect(mockEventListener).toHaveBeenCalledWith(progressEvents[1]);
    });

    it('should handle conversion errors appropriately', async () => {
      const sessionId = 'session-001';
      const processingError = new ProcessingError(
        ProcessingErrorType.ENCODING_ERROR,
        'FFmpeg encoding failed',
        'FFMPEG_ENCODING_FAILED',
        { exitCode: 1, stderr: 'Invalid codec parameters' }
      );

      (mockVideoProcessor.startConversion as jest.Mock).mockRejectedValue(processingError);

      await expect(mockVideoProcessor.startConversion(sessionId, {} as ProcessingOptions))
        .rejects.toThrow('FFmpeg encoding failed');
    });
  });

  describe('pauseConversion', () => {
    it('should pause an active conversion session', async () => {
      const sessionId = 'session-001';
      (mockVideoProcessor.pauseConversion as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.pauseConversion(sessionId);
      
      expect(mockVideoProcessor.pauseConversion).toHaveBeenCalledWith(sessionId);
    });

    it('should throw error when pausing non-existent session', async () => {
      const sessionId = 'non-existent-session';
      const error = new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        'Session not found',
        'SESSION_NOT_FOUND'
      );

      (mockVideoProcessor.pauseConversion as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.pauseConversion(sessionId)).rejects.toThrow('Session not found');
    });

    it('should handle pause for already paused session', async () => {
      const sessionId = 'session-001';
      const error = new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        'Session is already paused',
        'SESSION_ALREADY_PAUSED'
      );

      (mockVideoProcessor.pauseConversion as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.pauseConversion(sessionId)).rejects.toThrow('Session is already paused');
    });
  });

  describe('resumeConversion', () => {
    it('should resume a paused conversion session', async () => {
      const sessionId = 'session-001';
      (mockVideoProcessor.resumeConversion as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.resumeConversion(sessionId);
      
      expect(mockVideoProcessor.resumeConversion).toHaveBeenCalledWith(sessionId);
    });

    it('should throw error when resuming non-paused session', async () => {
      const sessionId = 'session-001';
      const error = new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        'Session is not paused',
        'SESSION_NOT_PAUSED'
      );

      (mockVideoProcessor.resumeConversion as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.resumeConversion(sessionId)).rejects.toThrow('Session is not paused');
    });
  });

  describe('cancelConversion', () => {
    it('should cancel a conversion session and cleanup resources', async () => {
      const sessionId = 'session-001';
      (mockVideoProcessor.cancelConversion as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.cancelConversion(sessionId);
      
      expect(mockVideoProcessor.cancelConversion).toHaveBeenCalledWith(sessionId);
    });

    it('should handle cancellation of completed session', async () => {
      const sessionId = 'session-001';
      const error = new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        'Cannot cancel completed session',
        'SESSION_ALREADY_COMPLETED'
      );

      (mockVideoProcessor.cancelConversion as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.cancelConversion(sessionId)).rejects.toThrow('Cannot cancel completed session');
    });
  });

  describe('getSessionStatus', () => {
    it('should return current session status and progress', async () => {
      const sessionId = 'session-001';
      const expectedStatus: ConversionSession = {
        id: sessionId,
        request: mockConversionRequest,
        state: SessionState.PROCESSING,
        createdAt: new Date(),
        startedAt: new Date(),
        progress: {
          percentage: 65,
          processedDuration: 19500,
          totalDuration: 30000,
          currentPhase: 'encoding',
          estimatedTimeRemaining: 15000,
          processingSpeed: 1.8,
        },
        statistics: {
          startTime: new Date(),
          bytesProcessed: 34078720, // ~32.5MB
          framesProcessed: 585,
          averageSpeed: 1.6,
          peakMemoryUsage: 134217728, // 128MB
          cpuUsage: 75.5,
        },
      };

      (mockVideoProcessor.getSessionStatus as jest.Mock).mockResolvedValue(expectedStatus);

      const status = await mockVideoProcessor.getSessionStatus(sessionId);
      
      expect(mockVideoProcessor.getSessionStatus).toHaveBeenCalledWith(sessionId);
      expect(status.id).toBe(sessionId);
      expect(status.state).toBe(SessionState.PROCESSING);
      expect(status.progress.percentage).toBe(65);
    });

    it('should throw error for non-existent session', async () => {
      const sessionId = 'non-existent-session';
      const error = new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        'Session not found',
        'SESSION_NOT_FOUND'
      );

      (mockVideoProcessor.getSessionStatus as jest.Mock).mockRejectedValue(error);

      await expect(mockVideoProcessor.getSessionStatus(sessionId)).rejects.toThrow('Session not found');
    });
  });

  describe('getSupportedFormats', () => {
    it('should return list of supported output formats', async () => {
      const supportedFormats = [
        OutputFormat.MP4,
        OutputFormat.MOV,
        OutputFormat.AVI,
        OutputFormat.MKV,
      ];

      (mockVideoProcessor.getSupportedFormats as jest.Mock).mockResolvedValue(supportedFormats);

      const formats = await mockVideoProcessor.getSupportedFormats();
      
      expect(formats).toEqual(supportedFormats);
      expect(formats).toContain(OutputFormat.MP4);
      expect(formats).toContain(OutputFormat.MOV);
    });

    it('should return formats based on device capabilities', async () => {
      const limitedCapabilities = {
        ...mockDeviceCapabilities,
        performance: { ...mockDeviceCapabilities.performance, videoProcessingScore: 35.0 },
      };

      const limitedFormats = [OutputFormat.MP4]; // Only basic format for low-end device

      (mockVideoProcessor.getSupportedFormats as jest.Mock).mockResolvedValue(limitedFormats);

      const formats = await mockVideoProcessor.getSupportedFormats(limitedCapabilities);
      
      expect(formats).toEqual(limitedFormats);
      expect(formats).toHaveLength(1);
    });
  });

  describe('getQualityProfiles', () => {
    it('should return available quality profiles', async () => {
      const qualityProfiles: QualityProfile[] = [
        {
          quality: VideoQuality.LOW,
          width: 640,
          height: 360,
          bitrate: 1000000, // 1 Mbps
          frameRate: 30,
          codecProfile: 'baseline',
          description: 'Low quality for fast processing',
        },
        {
          quality: VideoQuality.HD,
          width: 1280,
          height: 720,
          bitrate: 3000000, // 3 Mbps
          frameRate: 30,
          codecProfile: 'main',
          description: 'HD quality for balanced size and quality',
        },
        {
          quality: VideoQuality.FULL_HD,
          width: 1920,
          height: 1080,
          bitrate: 5000000, // 5 Mbps
          frameRate: 30,
          codecProfile: 'high',
          description: 'Full HD for high quality output',
        },
      ];

      (mockVideoProcessor.getQualityProfiles as jest.Mock).mockResolvedValue(qualityProfiles);

      const profiles = await mockVideoProcessor.getQualityProfiles();
      
      expect(profiles).toHaveLength(3);
      expect(profiles[0]?.quality).toBe(VideoQuality.LOW);
      expect(profiles[1]?.quality).toBe(VideoQuality.HD);
      expect(profiles[2]?.quality).toBe(VideoQuality.FULL_HD);
    });
  });

  describe('validateRequest', () => {
    it('should validate a proper conversion request', async () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      (mockVideoProcessor.validateRequest as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockVideoProcessor.validateRequest(mockConversionRequest);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid conversion requests', async () => {
      const invalidRequest = {
        ...mockConversionRequest,
        outputPath: '', // Invalid empty path
        quality: 'invalid_quality' as any,
      };

      const validationResult = {
        isValid: false,
        errors: [
          'Output path is required',
          'Invalid quality setting',
        ],
        warnings: [],
      };

      (mockVideoProcessor.validateRequest as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockVideoProcessor.validateRequest(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Output path is required');
      expect(result.errors).toContain('Invalid quality setting');
    });

    it('should provide warnings for suboptimal settings', async () => {
      const requestWithWarnings = {
        ...mockConversionRequest,
        quality: VideoQuality.UHD_4K, // Too high for device
      };

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [
          'Selected quality may be too high for device capabilities',
          'Consider using hardware acceleration for better performance',
        ],
      };

      (mockVideoProcessor.validateRequest as jest.Mock).mockResolvedValue(validationResult);

      const result = await mockVideoProcessor.validateRequest(requestWithWarnings);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Selected quality may be too high for device capabilities');
    });
  });

  describe('estimateProcessingTime', () => {
    it('should estimate processing time based on video and device capabilities', async () => {
      const estimatedTime = 45000; // 45 seconds

      (mockVideoProcessor.estimateProcessingTime as jest.Mock).mockResolvedValue(estimatedTime);

      const time = await mockVideoProcessor.estimateProcessingTime(
        mockConversionRequest,
        mockDeviceCapabilities
      );
      
      expect(time).toBe(45000);
      expect(mockVideoProcessor.estimateProcessingTime).toHaveBeenCalledWith(
        mockConversionRequest,
        mockDeviceCapabilities
      );
    });

    it('should adjust estimates based on device performance', async () => {
      const lowEndCapabilities = {
        ...mockDeviceCapabilities,
        performance: { ...mockDeviceCapabilities.performance, videoProcessingScore: 40.0 },
      };

      const longerEstimate = 120000; // 2 minutes for low-end device

      (mockVideoProcessor.estimateProcessingTime as jest.Mock).mockResolvedValue(longerEstimate);

      const time = await mockVideoProcessor.estimateProcessingTime(
        mockConversionRequest,
        lowEndCapabilities
      );
      
      expect(time).toBe(120000);
    });
  });

  describe('estimateOutputSize', () => {
    it('should estimate output file size', async () => {
      const estimatedSize = 20971520; // ~20MB

      (mockVideoProcessor.estimateOutputSize as jest.Mock).mockResolvedValue(estimatedSize);

      const size = await mockVideoProcessor.estimateOutputSize(mockConversionRequest);
      
      expect(size).toBe(20971520);
      expect(mockVideoProcessor.estimateOutputSize).toHaveBeenCalledWith(mockConversionRequest);
    });

    it('should consider quality settings in size estimation', async () => {
      const highQualityRequest = {
        ...mockConversionRequest,
        quality: VideoQuality.UHD_4K,
      };

      const largerEstimate = 104857600; // ~100MB for 4K

      (mockVideoProcessor.estimateOutputSize as jest.Mock).mockResolvedValue(largerEstimate);

      const size = await mockVideoProcessor.estimateOutputSize(highQualityRequest);
      
      expect(size).toBeGreaterThan(20971520); // Larger than HD estimate
    });
  });

  describe('cleanup', () => {
    it('should cleanup temporary files and resources', async () => {
      (mockVideoProcessor.cleanup as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.cleanup();
      
      expect(mockVideoProcessor.cleanup).toHaveBeenCalled();
    });

    it('should cleanup specific session resources', async () => {
      const sessionId = 'session-001';
      (mockVideoProcessor.cleanup as jest.Mock).mockResolvedValue(undefined);

      await mockVideoProcessor.cleanup(sessionId);
      
      expect(mockVideoProcessor.cleanup).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('Error Handling', () => {
    it('should define ProcessingError class with proper types', () => {
      const error = new ProcessingError(
        ProcessingErrorType.ENCODING_ERROR,
        'Test encoding error',
        'TEST_ENCODING_ERROR',
        { details: 'Additional error details' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(ProcessingErrorType.ENCODING_ERROR);
      expect(error.message).toBe('Test encoding error');
      expect(error.code).toBe('TEST_ENCODING_ERROR');
      expect(error.details).toEqual({ details: 'Additional error details' });
    });

    it('should handle different error types', () => {
      const errorTypes = [
        ProcessingErrorType.FILE_NOT_FOUND,
        ProcessingErrorType.INSUFFICIENT_STORAGE,
        ProcessingErrorType.UNSUPPORTED_FORMAT,
        ProcessingErrorType.DEVICE_OVERHEATING,
        ProcessingErrorType.LOW_BATTERY,
        ProcessingErrorType.ENCODING_ERROR,
        ProcessingErrorType.DECODING_ERROR,
        ProcessingErrorType.PERMISSION_DENIED,
        ProcessingErrorType.NETWORK_ERROR,
        ProcessingErrorType.TIMEOUT_ERROR,
        ProcessingErrorType.VALIDATION_ERROR,
        ProcessingErrorType.SESSION_NOT_FOUND,
        ProcessingErrorType.INVALID_OPERATION,
        ProcessingErrorType.UNKNOWN_ERROR,
      ];

      errorTypes.forEach(type => {
        const error = new ProcessingError(type, `Test ${type}`, `TEST_${type}`);
        expect(error.type).toBe(type);
      });
    });
  });

  describe('Session State Management', () => {
    it('should define all session states', () => {
      const states = [
        SessionState.CREATED,
        SessionState.VALIDATED,
        SessionState.QUEUED,
        SessionState.PROCESSING,
        SessionState.PAUSED,
        SessionState.COMPLETED,
        SessionState.FAILED,
        SessionState.CANCELLED,
      ];

      states.forEach(state => {
        expect(Object.values(SessionState)).toContain(state);
      });
    });

    it('should track state transitions properly', () => {
      const session: ConversionSession = {
        id: 'session-001',
        request: mockConversionRequest,
        state: SessionState.CREATED,
        createdAt: new Date(),
        progress: {
          percentage: 0,
          processedDuration: 0,
          totalDuration: 30000,
          currentPhase: 'initializing',
          estimatedTimeRemaining: 60000,
          processingSpeed: 0,
        },
        statistics: {
          startTime: new Date(),
          bytesProcessed: 0,
          framesProcessed: 0,
          averageSpeed: 0,
          peakMemoryUsage: 0,
          cpuUsage: 0,
        },
      };

      // Test state transitions
      expect(session.state).toBe(SessionState.CREATED);
      
      session.state = SessionState.PROCESSING;
      expect(session.state).toBe(SessionState.PROCESSING);
      
      session.state = SessionState.COMPLETED;
      expect(session.state).toBe(SessionState.COMPLETED);
    });
  });
});