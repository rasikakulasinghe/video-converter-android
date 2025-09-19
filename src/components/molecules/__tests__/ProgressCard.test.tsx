import { ProgressCard, ProgressCardProps, ProgressCardStatus, VideoFileInfo, ConversionProgress } from '../ProgressCard';

describe('ProgressCard Component Types and Exports', () => {
  it('should export ProgressCard component', () => {
    expect(ProgressCard).toBeDefined();
    expect(typeof ProgressCard).toBe('function');
  });

  it('should export ProgressCardProps interface', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'test.mov',
      size: 104857600,
      duration: 120,
      resolution: '1920x1080',
      format: 'MOV',
    };

    const props: ProgressCardProps = {
      videoFile: mockVideoFile,
      status: 'idle',
    };
    
    expect(props.videoFile).toBe(mockVideoFile);
    expect(props.status).toBe('idle');
  });

  it('should export ProgressCardStatus type', () => {
    const statuses: ProgressCardStatus[] = ['idle', 'preparing', 'converting', 'completed', 'error', 'cancelled'];
    
    expect(statuses).toHaveLength(6);
    expect(statuses).toContain('idle');
    expect(statuses).toContain('preparing');
    expect(statuses).toContain('converting');
    expect(statuses).toContain('completed');
    expect(statuses).toContain('error');
    expect(statuses).toContain('cancelled');
  });

  it('should export VideoFileInfo interface', () => {
    const videoFile: VideoFileInfo = {
      filename: 'sample_video.mp4',
      size: 52428800,
      duration: 180,
      resolution: '1280x720',
      format: 'MP4',
    };

    expect(videoFile.filename).toBe('sample_video.mp4');
    expect(videoFile.size).toBe(52428800);
    expect(videoFile.duration).toBe(180);
    expect(videoFile.resolution).toBe('1280x720');
    expect(videoFile.format).toBe('MP4');
  });

  it('should export ConversionProgress interface', () => {
    const progress: ConversionProgress = {
      percentage: 65,
      estimatedTimeRemaining: 45,
      phase: 'converting',
      speed: '2.1x',
      processedFrames: 1950,
      totalFrames: 3000,
    };

    expect(progress.percentage).toBe(65);
    expect(progress.estimatedTimeRemaining).toBe(45);
    expect(progress.phase).toBe('converting');
    expect(progress.speed).toBe('2.1x');
    expect(progress.processedFrames).toBe(1950);
    expect(progress.totalFrames).toBe(3000);
  });

  describe('ProgressCardProps interface', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'test.mov',
      size: 104857600,
      duration: 120,
      resolution: '1920x1080',
      format: 'MOV',
    };

    it('should require videoFile and status properties', () => {
      const minimalProps: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'idle',
      };

      expect(minimalProps.videoFile).toBe(mockVideoFile);
      expect(minimalProps.status).toBe('idle');
    });

    it('should accept all optional properties', () => {
      const mockProgress: ConversionProgress = {
        percentage: 50,
        estimatedTimeRemaining: 60,
        phase: 'converting',
        speed: '1.5x',
      };

      const fullProps: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        progress: mockProgress,
        errorMessage: 'Conversion failed',
        onCancel: jest.fn(),
        onRetry: jest.fn(),
        onViewResult: jest.fn(),
        onStartConversion: jest.fn(),
        containerStyle: { margin: 10 },
        testID: 'test-progress-card',
        accessibilityLabel: 'Video conversion progress',
      };

      expect(fullProps.videoFile).toBe(mockVideoFile);
      expect(fullProps.status).toBe('converting');
      expect(fullProps.progress).toBe(mockProgress);
      expect(fullProps.errorMessage).toBe('Conversion failed');
      expect(typeof fullProps.onCancel).toBe('function');
      expect(typeof fullProps.onRetry).toBe('function');
      expect(typeof fullProps.onViewResult).toBe('function');
      expect(typeof fullProps.onStartConversion).toBe('function');
      expect(fullProps.containerStyle).toEqual({ margin: 10 });
      expect(fullProps.testID).toBe('test-progress-card');
      expect(fullProps.accessibilityLabel).toBe('Video conversion progress');
    });
  });

  describe('VideoFileInfo properties', () => {
    it('should accept various filename types', () => {
      const files: VideoFileInfo[] = [
        { filename: 'video.mp4', size: 1000, duration: 10, resolution: '720p', format: 'MP4' },
        { filename: 'movie with spaces.mov', size: 2000, duration: 20, resolution: '1080p', format: 'MOV' },
        { filename: 'file-with-dashes.avi', size: 3000, duration: 30, resolution: '4K', format: 'AVI' },
        { filename: 'file_with_underscores.mkv', size: 4000, duration: 40, resolution: '1440p', format: 'MKV' },
      ];

      files.forEach(file => {
        expect(typeof file.filename).toBe('string');
        expect(file.filename.length).toBeGreaterThan(0);
      });
    });

    it('should accept various file sizes', () => {
      const sizes = [
        0,           // 0 bytes
        1024,        // 1 KB
        1048576,     // 1 MB
        104857600,   // 100 MB
        1073741824,  // 1 GB
      ];

      sizes.forEach(size => {
        const videoFile: VideoFileInfo = {
          filename: 'test.mp4',
          size,
          duration: 60,
          resolution: '1080p',
          format: 'MP4',
        };
        expect(videoFile.size).toBe(size);
      });
    });

    it('should accept various durations', () => {
      const durations = [1, 30, 60, 300, 3600, 7200]; // 1s to 2h

      durations.forEach(duration => {
        const videoFile: VideoFileInfo = {
          filename: 'test.mp4',
          size: 1000000,
          duration,
          resolution: '1080p',
          format: 'MP4',
        };
        expect(videoFile.duration).toBe(duration);
      });
    });

    it('should accept various resolutions', () => {
      const resolutions = ['480p', '720p', '1080p', '1440p', '4K', '1920x1080', '3840x2160'];

      resolutions.forEach(resolution => {
        const videoFile: VideoFileInfo = {
          filename: 'test.mp4',
          size: 1000000,
          duration: 60,
          resolution,
          format: 'MP4',
        };
        expect(videoFile.resolution).toBe(resolution);
      });
    });

    it('should accept various formats', () => {
      const formats = ['MP4', 'MOV', 'AVI', 'MKV', 'WMV', 'FLV'];

      formats.forEach(format => {
        const videoFile: VideoFileInfo = {
          filename: 'test.' + format.toLowerCase(),
          size: 1000000,
          duration: 60,
          resolution: '1080p',
          format,
        };
        expect(videoFile.format).toBe(format);
      });
    });
  });

  describe('ConversionProgress properties', () => {
    it('should accept percentage values', () => {
      const percentages = [0, 25, 50, 75, 100];

      percentages.forEach(percentage => {
        const progress: ConversionProgress = {
          percentage,
          phase: 'converting',
        };
        expect(progress.percentage).toBe(percentage);
      });
    });

    it('should accept conversion phases', () => {
      const phases: ConversionProgress['phase'][] = ['analyzing', 'converting', 'optimizing', 'finalizing'];

      phases.forEach(phase => {
        const progress: ConversionProgress = {
          percentage: 50,
          phase,
        };
        expect(progress.phase).toBe(phase);
      });
    });

    it('should accept optional properties', () => {
      const progress: ConversionProgress = {
        percentage: 75,
        phase: 'converting',
        estimatedTimeRemaining: 120,
        speed: '3.2x',
        processedFrames: 2250,
        totalFrames: 3000,
      };

      expect(progress.estimatedTimeRemaining).toBe(120);
      expect(progress.speed).toBe('3.2x');
      expect(progress.processedFrames).toBe(2250);
      expect(progress.totalFrames).toBe(3000);
    });

    it('should work with minimal required properties', () => {
      const progress: ConversionProgress = {
        percentage: 30,
        phase: 'analyzing',
      };

      expect(progress.percentage).toBe(30);
      expect(progress.phase).toBe('analyzing');
      expect(progress.estimatedTimeRemaining).toBeUndefined();
      expect(progress.speed).toBeUndefined();
      expect(progress.processedFrames).toBeUndefined();
      expect(progress.totalFrames).toBeUndefined();
    });
  });

  describe('Status types', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'test.mp4',
      size: 1000000,
      duration: 60,
      resolution: '1080p',
      format: 'MP4',
    };

    it('should accept idle status', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'idle',
      };
      expect(props.status).toBe('idle');
    });

    it('should accept preparing status', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'preparing',
      };
      expect(props.status).toBe('preparing');
    });

    it('should accept converting status with progress', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        progress: {
          percentage: 45,
          phase: 'converting',
        },
      };
      expect(props.status).toBe('converting');
      expect(props.progress?.percentage).toBe(45);
    });

    it('should accept completed status', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'completed',
      };
      expect(props.status).toBe('completed');
    });

    it('should accept error status with message', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'error',
        errorMessage: 'Insufficient storage space',
      };
      expect(props.status).toBe('error');
      expect(props.errorMessage).toBe('Insufficient storage space');
    });

    it('should accept cancelled status', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'cancelled',
      };
      expect(props.status).toBe('cancelled');
    });
  });

  describe('Callback functions', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'test.mp4',
      size: 1000000,
      duration: 60,
      resolution: '1080p',
      format: 'MP4',
    };

    it('should accept onCancel callback', () => {
      const onCancel = jest.fn();
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        onCancel,
      };
      
      expect(props.onCancel).toBe(onCancel);
      expect(typeof props.onCancel).toBe('function');
    });

    it('should accept onRetry callback', () => {
      const onRetry = jest.fn();
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'error',
        onRetry,
      };
      
      expect(props.onRetry).toBe(onRetry);
      expect(typeof props.onRetry).toBe('function');
    });

    it('should accept onViewResult callback', () => {
      const onViewResult = jest.fn();
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'completed',
        onViewResult,
      };
      
      expect(props.onViewResult).toBe(onViewResult);
      expect(typeof props.onViewResult).toBe('function');
    });

    it('should accept onStartConversion callback', () => {
      const onStartConversion = jest.fn();
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'idle',
        onStartConversion,
      };
      
      expect(props.onStartConversion).toBe(onStartConversion);
      expect(typeof props.onStartConversion).toBe('function');
    });

    it('should accept all callbacks together', () => {
      const callbacks = {
        onCancel: jest.fn(),
        onRetry: jest.fn(),
        onViewResult: jest.fn(),
        onStartConversion: jest.fn(),
      };

      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        ...callbacks,
      };

      Object.values(callbacks).forEach(callback => {
        expect(typeof callback).toBe('function');
      });
    });
  });

  describe('Styling and accessibility', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'test.mp4',
      size: 1000000,
      duration: 60,
      resolution: '1080p',
      format: 'MP4',
    };

    it('should accept custom container style', () => {
      const customStyle = {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        margin: 16,
        padding: 20,
      };

      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'idle',
        containerStyle: customStyle,
      };

      expect(props.containerStyle).toBe(customStyle);
    });

    it('should accept testID for testing', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        testID: 'conversion-progress-card',
      };

      expect(props.testID).toBe('conversion-progress-card');
    });

    it('should accept accessibility label', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'completed',
        accessibilityLabel: 'Video conversion completed successfully',
      };

      expect(props.accessibilityLabel).toBe('Video conversion completed successfully');
    });

    it('should work without optional styling properties', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'preparing',
      };

      expect(props.containerStyle).toBeUndefined();
      expect(props.testID).toBeUndefined();
      expect(props.accessibilityLabel).toBeUndefined();
    });
  });

  describe('Common usage patterns', () => {
    const mockVideoFile: VideoFileInfo = {
      filename: 'vacation_video.mov',
      size: 157286400, // 150 MB
      duration: 600,   // 10 minutes
      resolution: '1920x1080',
      format: 'MOV',
    };

    it('should support idle state for initial display', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'idle',
        onStartConversion: jest.fn(),
      };

      expect(props.status).toBe('idle');
      expect(props.onStartConversion).toBeDefined();
    });

    it('should support preparing state for initial setup', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'preparing',
        onCancel: jest.fn(),
      };

      expect(props.status).toBe('preparing');
      expect(props.onCancel).toBeDefined();
    });

    it('should support active conversion with detailed progress', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'converting',
        progress: {
          percentage: 67,
          estimatedTimeRemaining: 45,
          phase: 'converting',
          speed: '2.8x',
          processedFrames: 10050,
          totalFrames: 15000,
        },
        onCancel: jest.fn(),
      };

      expect(props.status).toBe('converting');
      expect(props.progress?.percentage).toBe(67);
      expect(props.progress?.speed).toBe('2.8x');
      expect(props.onCancel).toBeDefined();
    });

    it('should support successful completion', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'completed',
        onViewResult: jest.fn(),
      };

      expect(props.status).toBe('completed');
      expect(props.onViewResult).toBeDefined();
    });

    it('should support error handling with retry', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'error',
        errorMessage: 'Insufficient disk space to complete conversion',
        onRetry: jest.fn(),
      };

      expect(props.status).toBe('error');
      expect(props.errorMessage).toContain('disk space');
      expect(props.onRetry).toBeDefined();
    });

    it('should support cancellation state', () => {
      const props: ProgressCardProps = {
        videoFile: mockVideoFile,
        status: 'cancelled',
      };

      expect(props.status).toBe('cancelled');
    });
  });

  describe('Component structure', () => {
    it('should be a React functional component', () => {
      expect(typeof ProgressCard).toBe('function');
      expect(ProgressCard.prototype).toBeUndefined(); // Functional components don't have prototype
    });

    it('should have displayName or function name', () => {
      expect(ProgressCard.name || ProgressCard.displayName).toBeDefined();
    });
  });
});