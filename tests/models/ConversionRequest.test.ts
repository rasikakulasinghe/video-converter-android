import { ConversionRequest, ConversionQualityPreset, ConversionOptions, OutputFormat } from '../../src/types/models';
import { 
  validateConversionRequest, 
  createQualityPreset, 
  estimateConversionTime, 
  validateOutputPath,
  getDefaultConversionOptions 
} from '../../src/types/models/ConversionRequest';
import { VideoFile, VideoQuality, VideoFormat } from '../../src/types/models';

describe('ConversionRequest Model', () => {
  // Mock VideoFile for testing
  const mockVideoFile: VideoFile = {
    id: 'test-video-001',
    name: 'sample-video.mp4',
    path: '/storage/emulated/0/DCIM/Camera/sample-video.mp4',
    size: 52428800, // 50MB
    mimeType: 'video/mp4',
    format: VideoFormat.MP4,
    createdAt: new Date('2025-09-17T10:00:00Z'),
    modifiedAt: new Date('2025-09-17T10:05:00Z'),
    metadata: {
      duration: 120000, // 2 minutes
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 5000000,
      codec: 'h264',
      codecName: 'H.264',
      audioCodec: 'aac',
      audioBitrate: 128000,
      audioSampleRate: 44100,
      audioChannels: 2,
    },
  };

  describe('ConversionRequest Interface', () => {
    it('should have all required properties', () => {
      const mockRequest: ConversionRequest = {
        id: 'conversion-001',
        inputFile: mockVideoFile,
        outputPath: '/storage/emulated/0/VideoConverter/converted-video.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        options: {
          preserveAudio: true,
          customBitrate: 2500000,
          customFrameRate: 30,
          startTime: 0,
          endTime: 120000,
          cropParams: {
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
          },
        },
        createdAt: new Date(),
      };

      expect(mockRequest).toHaveProperty('id');
      expect(mockRequest).toHaveProperty('inputFile');
      expect(mockRequest).toHaveProperty('outputPath');
      expect(mockRequest).toHaveProperty('targetQuality');
      expect(mockRequest).toHaveProperty('outputFormat');
      expect(mockRequest).toHaveProperty('options');
      expect(mockRequest).toHaveProperty('createdAt');
      expect(mockRequest).toHaveProperty('priority');
    });

    it('should support optional properties', () => {
      const minimalRequest: ConversionRequest = {
        id: 'minimal-001',
        inputFile: mockVideoFile,
        outputPath: '/path/to/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      expect(minimalRequest.options).toBeUndefined();
      expect(minimalRequest.targetQuality).toBeDefined();
    });

    it('should support different output formats', () => {
      const formats = [OutputFormat.MP4, OutputFormat.MOV, OutputFormat.AVI];
      
      formats.forEach(format => {
        const request: ConversionRequest = {
          id: `test-${format}`,
          inputFile: mockVideoFile,
          outputPath: `/path/to/output.${format.toLowerCase()}`,
          targetQuality: VideoQuality.HD,
          outputFormat: format,
          createdAt: new Date(),
        };

        expect(Object.values(OutputFormat)).toContain(request.outputFormat);
      });
    });
  });

  describe('validateConversionRequest', () => {
    const validRequest: ConversionRequest = {
      id: 'valid-request-001',
      inputFile: mockVideoFile,
      outputPath: '/storage/emulated/0/VideoConverter/output.mp4',
      targetQuality: VideoQuality.HD,
      outputFormat: OutputFormat.MP4,
      createdAt: new Date(),
    };

    it('should validate a correct ConversionRequest', () => {
      const result = validateConversionRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty or missing required fields', () => {
      const invalidRequest = {
        ...validRequest,
        id: '',
        outputPath: '',
      } as ConversionRequest;

      const result = validateConversionRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request ID is required');
      expect(result.errors).toContain('Output path is required');
    });

    it('should reject invalid output paths', () => {
      const invalidPath = {
        ...validRequest,
        outputPath: '/invalid/path/without/extension',
      } as ConversionRequest;

      const result = validateConversionRequest(invalidPath);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Output path must have a valid file extension');
    });

    it('should reject mismatched output format and file extension', () => {
      const mismatchedRequest = {
        ...validRequest,
        outputPath: '/path/to/video.avi',
        outputFormat: OutputFormat.MP4,
      } as ConversionRequest;

      const result = validateConversionRequest(mismatchedRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Output format does not match file extension');
    });

    it('should reject invalid time ranges', () => {
      const invalidTimeRange = {
        ...validRequest,
        options: {
          startTime: 60000, // Start at 1 minute
          endTime: 30000,   // End at 30 seconds (invalid)
        },
      } as ConversionRequest;

      const result = validateConversionRequest(invalidTimeRange);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End time must be greater than start time');
    });

    it('should reject time ranges beyond video duration', () => {
      const beyondDuration = {
        ...validRequest,
        options: {
          startTime: 0,
          endTime: 180000, // 3 minutes, but video is only 2 minutes
        },
      } as ConversionRequest;

      const result = validateConversionRequest(beyondDuration);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End time exceeds video duration');
    });

    it('should reject invalid crop parameters', () => {
      const invalidCrop = {
        ...validRequest,
        options: {
          cropParams: {
            x: -10, // Negative values
            y: -5,
            width: 2000, // Larger than source
            height: 1500,
          },
        },
      } as ConversionRequest;

      const result = validateConversionRequest(invalidCrop);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid crop parameters');
    });

    it('should reject invalid custom bitrates', () => {
      const invalidBitrate = {
        ...validRequest,
        options: {
          customBitrate: -1000, // Negative bitrate
        },
      } as ConversionRequest;

      const result = validateConversionRequest(invalidBitrate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom bitrate must be positive');
    });

    it('should reject invalid custom frame rates', () => {
      const invalidFrameRate = {
        ...validRequest,
        options: {
          customFrameRate: 0, // Invalid frame rate
        },
      } as ConversionRequest;

      const result = validateConversionRequest(invalidFrameRate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom frame rate must be between 1 and 120 fps');
    });

    it('should reject future creation dates', () => {
      const futureRequest = {
        ...validRequest,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      } as ConversionRequest;

      const result = validateConversionRequest(futureRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Creation date cannot be in the future');
    });
  });

  describe('createQualityPreset', () => {
    it('should create Low quality preset', () => {
      const preset = createQualityPreset(VideoQuality.LOW);
      
      expect(preset.quality).toBe(VideoQuality.LOW);
      expect(preset.targetBitrate).toBe(500000); // 500 kbps
      expect(preset.targetFrameRate).toBe(24);
      expect(preset.maxDimensions.width).toBe(640);
      expect(preset.maxDimensions.height).toBe(360);
    });

    it('should create HD quality preset', () => {
      const preset = createQualityPreset(VideoQuality.HD);
      
      expect(preset.quality).toBe(VideoQuality.HD);
      expect(preset.targetBitrate).toBe(2500000); // 2.5 Mbps
      expect(preset.targetFrameRate).toBe(30);
      expect(preset.maxDimensions.width).toBe(1280);
      expect(preset.maxDimensions.height).toBe(720);
    });

    it('should create 4K quality preset', () => {
      const preset = createQualityPreset(VideoQuality.UHD_4K);
      
      expect(preset.quality).toBe(VideoQuality.UHD_4K);
      expect(preset.targetBitrate).toBe(20000000); // 20 Mbps
      expect(preset.targetFrameRate).toBe(30);
      expect(preset.maxDimensions.width).toBe(3840);
      expect(preset.maxDimensions.height).toBe(2160);
    });

    it('should include appropriate audio settings', () => {
      const preset = createQualityPreset(VideoQuality.FULL_HD);
      
      expect(preset.audioSettings.codec).toBe('aac');
      expect(preset.audioSettings.bitrate).toBe(128000);
      expect(preset.audioSettings.sampleRate).toBe(44100);
      expect(preset.audioSettings.channels).toBe(2);
    });
  });

  describe('estimateConversionTime', () => {
    it('should estimate time for quality downgrade', () => {
      const request: ConversionRequest = {
        id: 'estimate-001',
        inputFile: mockVideoFile, // 1080p, 2 minutes
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.HD, // Downgrade to 720p
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const estimatedTime = estimateConversionTime(request);
      
      // Should be faster than real-time for quality downgrade
      expect(estimatedTime).toBeGreaterThan(0);
      expect(estimatedTime).toBeLessThan(mockVideoFile.metadata.duration);
    });

    it('should estimate longer time for quality upgrade', () => {
      const lowQualityVideo: VideoFile = {
        ...mockVideoFile,
        metadata: {
          ...mockVideoFile.metadata,
          width: 640,
          height: 360,
          bitrate: 500000,
        },
      };

      const request: ConversionRequest = {
        id: 'estimate-002',
        inputFile: lowQualityVideo,
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.FULL_HD, // Upgrade to 1080p
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const estimatedTime = estimateConversionTime(request);
      
      // Should take longer for quality upgrade
      expect(estimatedTime).toBeGreaterThan(lowQualityVideo.metadata.duration);
    });

    it('should consider trimming in time estimation', () => {
      const request: ConversionRequest = {
        id: 'estimate-003',
        inputFile: mockVideoFile,
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        options: {
          startTime: 30000, // Start at 30 seconds
          endTime: 90000,   // End at 90 seconds (1 minute output)
        },
        createdAt: new Date(),
      };

      const estimatedTime = estimateConversionTime(request);
      const fullVideoEstimate = estimateConversionTime({
        ...request,
      });

      // Trimmed video should take less time
      expect(estimatedTime).toBeLessThan(fullVideoEstimate);
    });

    it('should factor in crop operations', () => {
      const request: ConversionRequest = {
        id: 'estimate-004',
        inputFile: mockVideoFile,
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        options: {
          cropParams: {
            x: 100,
            y: 100,
            width: 1280,
            height: 720,
          },
        },
        createdAt: new Date(),
      };

      const estimatedTime = estimateConversionTime(request);
      const noCropEstimate = estimateConversionTime({
        ...request,
      });

      // Cropping should add processing time
      expect(estimatedTime).toBeGreaterThanOrEqual(noCropEstimate);
    });
  });

  describe('validateOutputPath', () => {
    it('should validate correct output paths', () => {
      const validPaths = [
        '/storage/emulated/0/VideoConverter/output.mp4',
        '/data/user/0/com.app/files/video.mov',
        'file:///storage/emulated/0/output.avi',
      ];

      validPaths.forEach(path => {
        expect(validateOutputPath(path)).toBe(true);
      });
    });

    it('should reject invalid output paths', () => {
      const invalidPaths = [
        '', // Empty path
        '/path/without/extension',
        'relative/path.mp4',
        '/path/with/invalid/chars?.mp4',
        '/path/with/spaces in name.mp4', // Spaces can cause issues
      ];

      invalidPaths.forEach(path => {
        expect(validateOutputPath(path)).toBe(false);
      });
    });

    it('should support different file extensions', () => {
      const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
      
      validExtensions.forEach(ext => {
        const path = `/storage/emulated/0/output${ext}`;
        expect(validateOutputPath(path)).toBe(true);
      });
    });
  });

  describe('getDefaultConversionOptions', () => {
    it('should return sensible defaults', () => {
      const options = getDefaultConversionOptions();
      
      expect(options.preserveAudio).toBe(true);
      expect(options.customBitrate).toBeUndefined();
      expect(options.customFrameRate).toBeUndefined();
      expect(options.startTime).toBe(0);
      expect(options.endTime).toBeUndefined();
      expect(options.cropParams).toBeUndefined();
    });

    it('should allow overriding defaults', () => {
      const customOptions = getDefaultConversionOptions({
        preserveAudio: false,
        customBitrate: 1000000,
      });
      
      expect(customOptions.preserveAudio).toBe(false);
      expect(customOptions.customBitrate).toBe(1000000);
      expect(customOptions.startTime).toBe(0); // Still default
    });
  });

  describe('ConversionRequest Edge Cases', () => {
    it('should handle very short videos', () => {
      const shortVideo: VideoFile = {
        ...mockVideoFile,
        metadata: {
          ...mockVideoFile.metadata,
          duration: 1000, // 1 second
        },
      };

      const request: ConversionRequest = {
        id: 'short-001',
        inputFile: shortVideo,
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const result = validateConversionRequest(request);
      expect(result.isValid).toBe(true);
    });

    it('should handle maximum duration videos', () => {
      const longVideo: VideoFile = {
        ...mockVideoFile,
        metadata: {
          ...mockVideoFile.metadata,
          duration: 3600000, // 1 hour - max allowed
        },
      };

      const request: ConversionRequest = {
        id: 'long-001',
        inputFile: longVideo,
        outputPath: '/path/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const result = validateConversionRequest(request);
      expect(result.isValid).toBe(true);
    });

    it('should handle different priority levels', () => {
      const priorities = ['low', 'normal', 'high', 'urgent'] as const;
      
      priorities.forEach(priority => {
        const request: ConversionRequest = {
          id: `priority-${priority}`,
          inputFile: mockVideoFile,
          outputPath: '/path/output.mp4',
          targetQuality: VideoQuality.HD,
          outputFormat: OutputFormat.MP4,
          createdAt: new Date(),
        };

        const result = validateConversionRequest(request);
        expect(result.isValid).toBe(true);
      });
    });
  });
});