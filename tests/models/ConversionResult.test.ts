import { ConversionResult, ConversionStatus, ConversionProgress, ConversionError, ConversionStats } from '../../src/types/models';
import { 
  validateConversionResult,
  createProgressUpdate,
  calculateCompressionRatio,
  formatConversionDuration,
  isConversionComplete,
  isConversionFailed,
  getErrorSeverity
} from '../../src/types/models/ConversionResult';
import { ConversionRequest, VideoFile, VideoQuality, OutputFormat } from '../../src/types/models';

describe('ConversionResult Model', () => {
  // Mock data for testing
  const mockVideoFile: VideoFile = {
    id: 'test-video-001',
    name: 'sample-video.mp4',
    path: '/storage/emulated/0/DCIM/Camera/sample-video.mp4',
    size: 52428800, // 50MB
    mimeType: 'video/mp4',
    createdAt: new Date('2025-09-17T10:00:00Z'),
    metadata: {
      duration: 120000, // 2 minutes
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 5000000,
      codec: 'h264',
      audioCodec: 'aac',
      audioBitrate: 128000,
      audioSampleRate: 44100,
      audioChannels: 2,
    },
  };

  const mockRequest: ConversionRequest = {
    id: 'conversion-001',
    inputFile: mockVideoFile,
    outputPath: '/storage/emulated/0/VideoConverter/output.mp4',
    targetQuality: VideoQuality.HD,
    outputFormat: OutputFormat.MP4,
    createdAt: new Date('2025-09-17T10:00:00Z'),
  };

  describe('ConversionResult Interface', () => {
    it('should have all required properties for successful conversion', () => {
      const successResult: ConversionResult = {
        id: 'result-001',
        request: mockRequest,
        status: ConversionStatus.COMPLETED,
        progress: {
          percentage: 100,
          currentFrame: 3600,
          totalFrames: 3600,
          processedDuration: 120000,
          totalDuration: 120000,
          estimatedTimeRemaining: 0,
          currentBitrate: 2500000,
          averageFps: 30,
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
        endTime: new Date('2025-09-17T10:02:30Z'),
        outputFile: {
          path: '/storage/emulated/0/VideoConverter/output.mp4',
          size: 26214400, // 25MB
          metadata: {
            duration: 120000,
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrate: 2500000,
            codec: 'h264',
            audioCodec: 'aac',
            audioBitrate: 128000,
            audioSampleRate: 44100,
            audioChannels: 2,
          },
        },
        stats: {
          inputSize: 52428800,
          outputSize: 26214400,
          compressionRatio: 0.5,
          processingDuration: 150000, // 2.5 minutes
          averageSpeed: 0.8, // 0.8x real-time
        },
      };

      expect(successResult).toHaveProperty('id');
      expect(successResult).toHaveProperty('request');
      expect(successResult).toHaveProperty('status');
      expect(successResult).toHaveProperty('progress');
      expect(successResult).toHaveProperty('startTime');
      expect(successResult).toHaveProperty('endTime');
      expect(successResult).toHaveProperty('outputFile');
      expect(successResult).toHaveProperty('stats');
    });

    it('should support failed conversion with error information', () => {
      const failedResult: ConversionResult = {
        id: 'result-002',
        request: mockRequest,
        status: ConversionStatus.FAILED,
        progress: {
          percentage: 45,
          currentFrame: 1620,
          totalFrames: 3600,
          processedDuration: 54000,
          totalDuration: 120000,
          estimatedTimeRemaining: 66000,
          currentBitrate: 2500000,
          averageFps: 28,
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
        endTime: new Date('2025-09-17T10:01:30Z'),
        error: {
          code: 'FFMPEG_ERROR',
          message: 'Failed to encode video: Insufficient memory',
          severity: 'critical',
          details: {
            ffmpegExitCode: 1,
            memoryUsage: 2048000000, // 2GB
            availableMemory: 1024000000, // 1GB
          },
        },
      };

      expect(failedResult).toHaveProperty('error');
      expect(failedResult.error?.code).toBe('FFMPEG_ERROR');
      expect(failedResult.error?.severity).toBe('critical');
      expect(failedResult.outputFile).toBeUndefined();
      expect(failedResult.stats).toBeUndefined();
    });

    it('should support in-progress conversion', () => {
      const progressResult: ConversionResult = {
        id: 'result-003',
        request: mockRequest,
        status: ConversionStatus.PROCESSING,
        progress: {
          percentage: 65,
          currentFrame: 2340,
          totalFrames: 3600,
          processedDuration: 78000,
          totalDuration: 120000,
          estimatedTimeRemaining: 42000,
          currentBitrate: 2500000,
          averageFps: 29,
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
      };

      expect(progressResult.status).toBe(ConversionStatus.PROCESSING);
      expect(progressResult.endTime).toBeUndefined();
      expect(progressResult.outputFile).toBeUndefined();
      expect(progressResult.stats).toBeUndefined();
    });
  });

  describe('validateConversionResult', () => {
    const validResult: ConversionResult = {
      id: 'valid-result-001',
      request: mockRequest,
      status: ConversionStatus.COMPLETED,
      progress: {
        percentage: 100,
        currentFrame: 3600,
        totalFrames: 3600,
        processedDuration: 120000,
        totalDuration: 120000,
        estimatedTimeRemaining: 0,
        currentBitrate: 2500000,
        averageFps: 30,
      },
      startTime: new Date('2025-09-17T10:00:00Z'),
      endTime: new Date('2025-09-17T10:02:30Z'),
      outputFile: {
        path: '/storage/emulated/0/VideoConverter/output.mp4',
        size: 26214400,
        metadata: {
          duration: 120000,
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrate: 2500000,
          codec: 'h264',
          audioCodec: 'aac',
          audioBitrate: 128000,
          audioSampleRate: 44100,
          audioChannels: 2,
        },
      },
    };

    it('should validate a correct ConversionResult', () => {
      const result = validateConversionResult(validResult);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty or missing required fields', () => {
      const invalidResult = {
        ...validResult,
        id: '',
        request: null,
      } as any;

      const result = validateConversionResult(invalidResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Result ID is required');
      expect(result.errors).toContain('Conversion request is required');
    });

    it('should reject invalid progress percentages', () => {
      const invalidProgress = {
        ...validResult,
        progress: {
          ...validResult.progress,
          percentage: 150, // Invalid percentage
        },
      };

      const result = validateConversionResult(invalidProgress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Progress percentage must be between 0 and 100');
    });

    it('should reject invalid frame counts', () => {
      const invalidFrames = {
        ...validResult,
        progress: {
          ...validResult.progress,
          currentFrame: 5000, // More than total frames
          totalFrames: 3600,
        },
      };

      const result = validateConversionResult(invalidFrames);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current frame cannot exceed total frames');
    });

    it('should reject invalid time ranges', () => {
      const invalidTime = {
        ...validResult,
        startTime: new Date('2025-09-17T10:00:00Z'),
        endTime: new Date('2025-09-17T09:59:00Z'), // End before start
      };

      const result = validateConversionResult(invalidTime);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End time must be after start time');
    });

    it('should require endTime for completed conversions', () => {
      const incompleteResult = {
        ...validResult,
        status: ConversionStatus.COMPLETED,
        endTime: undefined,
      };

      const result = validateConversionResult(incompleteResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End time is required for completed conversions');
    });

    it('should require outputFile for successful conversions', () => {
      const noOutputResult = {
        ...validResult,
        status: ConversionStatus.COMPLETED,
        outputFile: undefined,
      };

      const result = validateConversionResult(noOutputResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Output file is required for completed conversions');
    });

    it('should require error for failed conversions', () => {
      const noErrorResult = {
        ...validResult,
        status: ConversionStatus.FAILED,
        error: undefined,
      };

      const result = validateConversionResult(noErrorResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Error information is required for failed conversions');
    });

    it('should validate future start times', () => {
      const futureResult = {
        ...validResult,
        startTime: new Date('2026-01-01T00:00:00Z'),
      };

      const result = validateConversionResult(futureResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start time cannot be in the future');
    });

    it('should validate negative durations', () => {
      const negativeDuration = {
        ...validResult,
        progress: {
          ...validResult.progress,
          processedDuration: -1000,
        },
      };

      const result = validateConversionResult(negativeDuration);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Processed duration cannot be negative');
    });
  });

  describe('createProgressUpdate', () => {
    it('should create progress update with correct calculations', () => {
      const progress = createProgressUpdate({
        currentFrame: 1800,
        totalFrames: 3600,
        processedDuration: 60000,
        totalDuration: 120000,
        currentBitrate: 2500000,
        averageFps: 30,
      });

      expect(progress.percentage).toBe(50);
      expect(progress.currentFrame).toBe(1800);
      expect(progress.totalFrames).toBe(3600);
      expect(progress.processedDuration).toBe(60000);
      expect(progress.totalDuration).toBe(120000);
      expect(progress.estimatedTimeRemaining).toBe(60000);
      expect(progress.currentBitrate).toBe(2500000);
      expect(progress.averageFps).toBe(30);
    });

    it('should handle zero total frames gracefully', () => {
      const progress = createProgressUpdate({
        currentFrame: 0,
        totalFrames: 0,
        processedDuration: 0,
        totalDuration: 120000,
        currentBitrate: 0,
        averageFps: 0,
      });

      expect(progress.percentage).toBe(0);
      expect(progress.estimatedTimeRemaining).toBe(120000);
    });

    it('should cap percentage at 100', () => {
      const progress = createProgressUpdate({
        currentFrame: 4000, // More than total
        totalFrames: 3600,
        processedDuration: 130000, // More than total
        totalDuration: 120000,
        currentBitrate: 2500000,
        averageFps: 30,
      });

      expect(progress.percentage).toBe(100);
      expect(progress.estimatedTimeRemaining).toBe(0);
    });

    it('should handle very small remaining times', () => {
      const progress = createProgressUpdate({
        currentFrame: 3590,
        totalFrames: 3600,
        processedDuration: 119000,
        totalDuration: 120000,
        currentBitrate: 2500000,
        averageFps: 30,
      });

      expect(progress.percentage).toBeGreaterThan(99);
      expect(progress.estimatedTimeRemaining).toBeLessThan(2000);
    });
  });

  describe('calculateCompressionRatio', () => {
    it('should calculate correct compression ratio', () => {
      const ratio = calculateCompressionRatio(52428800, 26214400); // 50MB -> 25MB
      expect(ratio).toBe(0.5);
    });

    it('should handle no compression', () => {
      const ratio = calculateCompressionRatio(52428800, 52428800); // Same size
      expect(ratio).toBe(1.0);
    });

    it('should handle size increase', () => {
      const ratio = calculateCompressionRatio(26214400, 52428800); // 25MB -> 50MB
      expect(ratio).toBe(2.0);
    });

    it('should handle zero input size', () => {
      const ratio = calculateCompressionRatio(0, 26214400);
      expect(ratio).toBe(0);
    });

    it('should handle zero output size', () => {
      const ratio = calculateCompressionRatio(52428800, 0);
      expect(ratio).toBe(0);
    });
  });

  describe('formatConversionDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatConversionDuration(45000)).toBe('45s');
      expect(formatConversionDuration(5000)).toBe('5s');
    });

    it('should format minutes and seconds', () => {
      expect(formatConversionDuration(125000)).toBe('2m 5s'); // 2 minutes 5 seconds
      expect(formatConversionDuration(60000)).toBe('1m 0s'); // 1 minute
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatConversionDuration(3665000)).toBe('1h 1m 5s'); // 1 hour 1 minute 5 seconds
      expect(formatConversionDuration(3600000)).toBe('1h 0m 0s'); // 1 hour
    });

    it('should handle zero duration', () => {
      expect(formatConversionDuration(0)).toBe('0s');
    });

    it('should handle very small durations', () => {
      expect(formatConversionDuration(500)).toBe('0s'); // Less than 1 second
    });

    it('should handle very long durations', () => {
      expect(formatConversionDuration(7265000)).toBe('2h 1m 5s'); // 2 hours 1 minute 5 seconds
    });
  });

  describe('isConversionComplete', () => {
    it('should identify completed conversions', () => {
      const result: ConversionResult = {
        ...mockRequest,
        id: 'test',
        request: mockRequest,
        status: ConversionStatus.COMPLETED,
        progress: { percentage: 100 } as ConversionProgress,
        startTime: new Date(),
      };

      expect(isConversionComplete(result)).toBe(true);
    });

    it('should identify incomplete conversions', () => {
      const statuses = [
        ConversionStatus.PENDING,
        ConversionStatus.PROCESSING,
        ConversionStatus.PAUSED,
        ConversionStatus.FAILED,
        ConversionStatus.CANCELLED,
      ];

      statuses.forEach(status => {
        const result: ConversionResult = {
          ...mockRequest,
          id: 'test',
          request: mockRequest,
          status,
          progress: { percentage: 50 } as ConversionProgress,
          startTime: new Date(),
        };

        expect(isConversionComplete(result)).toBe(false);
      });
    });
  });

  describe('isConversionFailed', () => {
    it('should identify failed conversions', () => {
      const failedStatuses = [ConversionStatus.FAILED, ConversionStatus.CANCELLED];

      failedStatuses.forEach(status => {
        const result: ConversionResult = {
          ...mockRequest,
          id: 'test',
          request: mockRequest,
          status,
          progress: { percentage: 30 } as ConversionProgress,
          startTime: new Date(),
        };

        expect(isConversionFailed(result)).toBe(true);
      });
    });

    it('should identify non-failed conversions', () => {
      const successStatuses = [
        ConversionStatus.PENDING,
        ConversionStatus.PROCESSING,
        ConversionStatus.PAUSED,
        ConversionStatus.COMPLETED,
      ];

      successStatuses.forEach(status => {
        const result: ConversionResult = {
          ...mockRequest,
          id: 'test',
          request: mockRequest,
          status,
          progress: { percentage: 50 } as ConversionProgress,
          startTime: new Date(),
        };

        expect(isConversionFailed(result)).toBe(false);
      });
    });
  });

  describe('getErrorSeverity', () => {
    it('should identify critical errors', () => {
      const criticalErrors = [
        'FFMPEG_ERROR',
        'OUT_OF_MEMORY',
        'STORAGE_FULL',
        'THERMAL_THROTTLING',
      ];

      criticalErrors.forEach(code => {
        const error: ConversionError = {
          code,
          message: 'Critical error occurred',
          severity: 'critical',
        };

        expect(getErrorSeverity(error)).toBe('critical');
      });
    });

    it('should identify warning errors', () => {
      const warningErrors = [
        'LOW_BATTERY',
        'QUALITY_DEGRADED',
        'SLOW_PROCESSING',
      ];

      warningErrors.forEach(code => {
        const error: ConversionError = {
          code,
          message: 'Warning occurred',
          severity: 'warning',
        };

        expect(getErrorSeverity(error)).toBe('warning');
      });
    });

    it('should default to info for unknown errors', () => {
      const error: ConversionError = {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
        severity: 'info',
      };

      expect(getErrorSeverity(error)).toBe('info');
    });
  });

  describe('ConversionResult Edge Cases', () => {
    it('should handle very fast conversions', () => {
      const fastResult: ConversionResult = {
        id: 'fast-001',
        request: mockRequest,
        status: ConversionStatus.COMPLETED,
        progress: {
          percentage: 100,
          currentFrame: 300, // 10 second video
          totalFrames: 300,
          processedDuration: 10000,
          totalDuration: 10000,
          estimatedTimeRemaining: 0,
          currentBitrate: 1000000,
          averageFps: 30,
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
        endTime: new Date('2025-09-17T10:00:05Z'), // 5 seconds processing
        outputFile: {
          path: '/storage/emulated/0/VideoConverter/fast-output.mp4',
          size: 5242880, // 5MB
          metadata: {
            duration: 10000,
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrate: 1000000,
            codec: 'h264',
          },
        },
      };

      const result = validateConversionResult(fastResult);
      expect(result.isValid).toBe(true);
    });

    it('should handle very slow conversions', () => {
      const slowResult: ConversionResult = {
        id: 'slow-001',
        request: mockRequest,
        status: ConversionStatus.COMPLETED,
        progress: {
          percentage: 100,
          currentFrame: 3600,
          totalFrames: 3600,
          processedDuration: 120000,
          totalDuration: 120000,
          estimatedTimeRemaining: 0,
          currentBitrate: 500000,
          averageFps: 5, // Very slow processing
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
        endTime: new Date('2025-09-17T10:30:00Z'), // 30 minutes processing
        outputFile: {
          path: '/storage/emulated/0/VideoConverter/slow-output.mp4',
          size: 15728640, // 15MB
          metadata: {
            duration: 120000,
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrate: 500000,
            codec: 'h264',
          },
        },
      };

      const result = validateConversionResult(slowResult);
      expect(result.isValid).toBe(true);
    });

    it('should handle paused and resumed conversions', () => {
      const pausedResult: ConversionResult = {
        id: 'paused-001',
        request: mockRequest,
        status: ConversionStatus.PAUSED,
        progress: {
          percentage: 25,
          currentFrame: 900,
          totalFrames: 3600,
          processedDuration: 30000,
          totalDuration: 120000,
          estimatedTimeRemaining: 270000, // Longer due to pause
          currentBitrate: 2500000,
          averageFps: 20,
        },
        startTime: new Date('2025-09-17T10:00:00Z'),
      };

      const result = validateConversionResult(pausedResult);
      expect(result.isValid).toBe(true);
    });
  });
});