import { VideoFile, VideoMetadata, VideoQuality, VideoFormat } from '../../src/types/models';
import { validateVideoFile, getVideoQuality, isVideoSupported } from '../../src/types/models/VideoFile';

describe('VideoFile Model', () => {
  describe('VideoFile Interface', () => {
    it('should have all required properties', () => {
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
          duration: 120000, // 2 minutes in ms
          width: 1920,
          height: 1080,
          frameRate: 30,
          bitrate: 5000000, // 5 Mbps
          codec: 'h264',
          codecName: 'H.264',
          audioCodec: 'aac',
          audioBitrate: 128000,
          audioSampleRate: 44100,
          audioChannels: 2,
        },
      };

      expect(mockVideoFile).toHaveProperty('id');
      expect(mockVideoFile).toHaveProperty('name');
      expect(mockVideoFile).toHaveProperty('path');
      expect(mockVideoFile).toHaveProperty('size');
      expect(mockVideoFile).toHaveProperty('mimeType');
      expect(mockVideoFile).toHaveProperty('createdAt');
      expect(mockVideoFile).toHaveProperty('metadata');
      expect(mockVideoFile.metadata).toHaveProperty('duration');
      expect(mockVideoFile.metadata).toHaveProperty('width');
      expect(mockVideoFile.metadata).toHaveProperty('height');
      expect(mockVideoFile.metadata).toHaveProperty('frameRate');
      expect(mockVideoFile.metadata).toHaveProperty('bitrate');
      expect(mockVideoFile.metadata).toHaveProperty('codec');
    });

    it('should support optional metadata properties', () => {
      const minimalVideoFile: VideoFile = {
        id: 'minimal-001',
        name: 'minimal.mp4',
        path: '/path/to/minimal.mp4',
        size: 1024000,
        mimeType: 'video/mp4',
        format: VideoFormat.MP4,
        createdAt: new Date(),
        modifiedAt: new Date(),
        metadata: {
          duration: 30000,
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrate: 2000000,
          codec: 'h264',
          codecName: 'H.264',
        },
      };

      expect(minimalVideoFile.metadata.audioCodec).toBeUndefined();
      expect(minimalVideoFile.metadata.audioBitrate).toBeUndefined();
      expect(minimalVideoFile.metadata.audioSampleRate).toBeUndefined();
      expect(minimalVideoFile.metadata.audioChannels).toBeUndefined();
    });
  });

  describe('validateVideoFile', () => {
    const validVideoFile: VideoFile = {
      id: 'valid-001',
      name: 'valid-video.mp4',
      path: '/storage/emulated/0/DCIM/valid-video.mp4',
      size: 10485760, // 10MB
      mimeType: 'video/mp4',
      createdAt: new Date(),
      metadata: {
        duration: 60000,
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 3000000,
        codec: 'h264',
      },
    };

    it('should validate a correct VideoFile', () => {
      const result = validateVideoFile(validVideoFile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty or missing required fields', () => {
      const invalidVideoFile = {
        ...validVideoFile,
        id: '',
        name: '',
      } as VideoFile;

      const result = validateVideoFile(invalidVideoFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID is required');
      expect(result.errors).toContain('Name is required');
    });

    it('should reject invalid file paths', () => {
      const invalidPath = {
        ...validVideoFile,
        path: '',
      } as VideoFile;

      const result = validateVideoFile(invalidPath);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid file path is required');
    });

    it('should reject files that are too large', () => {
      const largeFile = {
        ...validVideoFile,
        size: 5368709120, // 5GB - exceeds 4GB limit
      } as VideoFile;

      const result = validateVideoFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum limit (4GB)');
    });

    it('should reject files that are too small', () => {
      const tinyFile = {
        ...validVideoFile,
        size: 512, // 512 bytes - too small
      } as VideoFile;

      const result = validateVideoFile(tinyFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size too small (minimum 1KB)');
    });

    it('should reject unsupported MIME types', () => {
      const unsupportedFile = {
        ...validVideoFile,
        mimeType: 'video/webm',
        format: VideoFormat.WEBM,
      } as VideoFile;

      const result = validateVideoFile(unsupportedFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported video format');
    });

    it('should reject videos with invalid dimensions', () => {
      const invalidDimensions = {
        ...validVideoFile,
        metadata: {
          ...validVideoFile.metadata,
          width: 0,
          height: -1080,
        },
      } as VideoFile;

      const result = validateVideoFile(invalidDimensions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid video dimensions');
    });

    it('should reject videos with invalid duration', () => {
      const invalidDuration = {
        ...validVideoFile,
        metadata: {
          ...validVideoFile.metadata,
          duration: -1000,
        },
      } as VideoFile;

      const result = validateVideoFile(invalidDuration);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid video duration');
    });

    it('should reject videos that are too long', () => {
      const tooLong = {
        ...validVideoFile,
        metadata: {
          ...validVideoFile.metadata,
          duration: 7200000, // 2 hours - exceeds 1 hour limit
        },
      } as VideoFile;

      const result = validateVideoFile(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Video duration exceeds maximum limit (1 hour)');
    });

    it('should reject videos with invalid frame rate', () => {
      const invalidFrameRate = {
        ...validVideoFile,
        metadata: {
          ...validVideoFile.metadata,
          frameRate: 0,
        },
      } as VideoFile;

      const result = validateVideoFile(invalidFrameRate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid frame rate');
    });

    it('should reject videos with invalid bitrate', () => {
      const invalidBitrate = {
        ...validVideoFile,
        metadata: {
          ...validVideoFile.metadata,
          bitrate: -1000,
        },
      } as VideoFile;

      const result = validateVideoFile(invalidBitrate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid bitrate');
    });
  });

  describe('getVideoQuality', () => {
    it('should detect 4K quality', () => {
      const video4K: VideoMetadata = {
        duration: 120000,
        width: 3840,
        height: 2160,
        frameRate: 30,
        bitrate: 20000000,
        codec: 'h264',
      };

      expect(getVideoQuality(video4K)).toBe(VideoQuality.UHD_4K);
    });

    it('should detect 1080p quality', () => {
      const video1080p: VideoMetadata = {
        duration: 120000,
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 5000000,
        codec: 'h264',
      };

      expect(getVideoQuality(video1080p)).toBe(VideoQuality.FULL_HD);
    });

    it('should detect 720p quality', () => {
      const video720p: VideoMetadata = {
        duration: 120000,
        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 2500000,
        codec: 'h264',
      };

      expect(getVideoQuality(video720p)).toBe(VideoQuality.HD);
    });

    it('should detect 480p quality', () => {
      const video480p: VideoMetadata = {
        duration: 120000,
        width: 854,
        height: 480,
        frameRate: 30,
        bitrate: 1000000,
        codec: 'h264',
      };

      expect(getVideoQuality(video480p)).toBe(VideoQuality.SD);
    });

    it('should detect 360p quality', () => {
      const video360p: VideoMetadata = {
        duration: 120000,
        width: 640,
        height: 360,
        frameRate: 30,
        bitrate: 500000,
        codec: 'h264',
      };

      expect(getVideoQuality(video360p)).toBe(VideoQuality.LOW);
    });

    it('should handle non-standard resolutions', () => {
      const videoCustom: VideoMetadata = {
        duration: 120000,
        width: 1366,
        height: 768,
        frameRate: 30,
        bitrate: 3000000,
        codec: 'h264',
      };

      // Should classify based on closest standard resolution
      expect(getVideoQuality(videoCustom)).toBe(VideoQuality.HD);
    });

    it('should handle portrait videos', () => {
      const videoPortrait: VideoMetadata = {
        duration: 120000,
        width: 1080,
        height: 1920,
        frameRate: 30,
        bitrate: 5000000,
        codec: 'h264',
      };

      expect(getVideoQuality(videoPortrait)).toBe(VideoQuality.FULL_HD);
    });
  });

  describe('isVideoSupported', () => {
    it('should support MP4 videos', () => {
      expect(isVideoSupported('video/mp4')).toBe(true);
    });

    it('should support MOV videos', () => {
      expect(isVideoSupported('video/quicktime')).toBe(true);
    });

    it('should support AVI videos', () => {
      expect(isVideoSupported('video/x-msvideo')).toBe(true);
    });

    it('should support MKV videos', () => {
      expect(isVideoSupported('video/x-matroska')).toBe(true);
    });

    it('should not support WebM videos', () => {
      expect(isVideoSupported('video/webm')).toBe(false);
    });

    it('should not support OGV videos', () => {
      expect(isVideoSupported('video/ogg')).toBe(false);
    });

    it('should not support non-video MIME types', () => {
      expect(isVideoSupported('image/jpeg')).toBe(false);
      expect(isVideoSupported('audio/mp3')).toBe(false);
      expect(isVideoSupported('application/pdf')).toBe(false);
    });

    it('should handle empty or invalid MIME types', () => {
      expect(isVideoSupported('')).toBe(false);
      expect(isVideoSupported('invalid')).toBe(false);
      expect(isVideoSupported('video/')).toBe(false);
    });
  });

  describe('VideoFile Edge Cases', () => {
    it('should handle very small valid videos', () => {
      const smallVideo: VideoFile = {
        id: 'small-001',
        name: 'small.mp4',
        path: '/path/to/small.mp4',
        size: 1024, // 1KB - minimum size
        mimeType: 'video/mp4',
        format: VideoFormat.MP4,
        createdAt: new Date(),
        modifiedAt: new Date(),
        metadata: {
          duration: 1000, // 1 second
          width: 320,
          height: 240,
          frameRate: 15,
          bitrate: 8000, // Very low bitrate
          codec: 'h264',
          codecName: 'H.264',
        },
      };

      const result = validateVideoFile(smallVideo);
      expect(result.isValid).toBe(true);
    });

    it('should handle maximum allowed video size', () => {
      const maxSizeVideo: VideoFile = {
        id: 'max-001',
        name: 'max-size.mp4',
        path: '/path/to/max-size.mp4',
        size: 4294967296, // 4GB - maximum allowed
        mimeType: 'video/mp4',
        format: VideoFormat.MP4,
        createdAt: new Date(),
        modifiedAt: new Date(),
        metadata: {
          duration: 3600000, // 1 hour - maximum duration
          width: 3840,
          height: 2160,
          frameRate: 60,
          bitrate: 100000000, // High bitrate
          codec: 'h264',
          codecName: 'H.264',
        },
      };

      const result = validateVideoFile(maxSizeVideo);
      expect(result.isValid).toBe(true);
    });

    it('should handle future creation dates gracefully', () => {
      const futureVideo: VideoFile = {
        id: 'future-001',
        name: 'future.mp4',
        path: '/path/to/future.mp4',
        size: 1048576,
        mimeType: 'video/mp4',
        createdAt: new Date('2026-01-01T00:00:00Z'), // Future date
        metadata: {
          duration: 30000,
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrate: 2000000,
          codec: 'h264',
          codecName: 'H.264',
        },
      };

      const result = validateVideoFile(futureVideo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Creation date cannot be in the future');
    });
  });
});