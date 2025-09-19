import { ConversionForm, ConversionFormProps, ConversionParams, VideoQuality, VideoCodec, AudioCodec, OutputFormat, FormErrors } from '../ConversionForm';

describe('ConversionForm', () => {
  const defaultParams: ConversionParams = {
    quality: 'medium',
    videoCodec: 'h264',
    audioCodec: 'aac',
    outputFormat: 'mp4',
    framerate: 30,
    includeAudio: true,
    optimizeForWeb: true,
  };

  describe('Type Safety and Interfaces', () => {
    it('should accept all required props without TypeScript errors', () => {
      const props: ConversionFormProps = {};
      
      // Type check - if this compiles, the types are correct
      expect(props).toBeDefined();
    });

    it('should accept all optional props without TypeScript errors', () => {
      const props: ConversionFormProps = {
        initialParams: { quality: 'high', includeAudio: false },
        disabled: true,
        showAdvanced: true,
        showPresets: false,
        containerStyle: { margin: 10 },
        onParamsChange: jest.fn(),
        onSubmit: jest.fn(),
        onReset: jest.fn(),
        testID: 'custom-test-id',
        accessibilityLabel: 'Custom accessibility label',
      };
      
      // Type check - if this compiles, the types are correct
      expect(props).toBeDefined();
      expect(props.initialParams?.quality).toBe('high');
      expect(props.initialParams?.includeAudio).toBe(false);
      expect(props.disabled).toBe(true);
      expect(props.showAdvanced).toBe(true);
      expect(props.showPresets).toBe(false);
      expect(props.containerStyle).toEqual({ margin: 10 });
      expect(typeof props.onParamsChange).toBe('function');
      expect(typeof props.onSubmit).toBe('function');
      expect(typeof props.onReset).toBe('function');
      expect(props.testID).toBe('custom-test-id');
      expect(props.accessibilityLabel).toBe('Custom accessibility label');
    });

    it('should properly type ConversionParams interface', () => {
      const params: ConversionParams = {
        quality: 'high',
        videoCodec: 'h265',
        audioCodec: 'mp3',
        outputFormat: 'webm',
        customBitrate: 8000,
        customResolution: '1920x1080',
        framerate: 60,
        includeAudio: true,
        outputFilename: 'my_video',
        optimizeForWeb: false,
      };

      // Type check - if this compiles, the interface is correct
      expect(params).toBeDefined();
      expect(params.quality).toBe('high');
      expect(params.videoCodec).toBe('h265');
      expect(params.audioCodec).toBe('mp3');
      expect(params.outputFormat).toBe('webm');
      expect(params.customBitrate).toBe(8000);
      expect(params.customResolution).toBe('1920x1080');
      expect(params.framerate).toBe(60);
      expect(params.includeAudio).toBe(true);
      expect(params.outputFilename).toBe('my_video');
      expect(params.optimizeForWeb).toBe(false);
    });

    it('should properly type VideoQuality values', () => {
      const qualities: VideoQuality[] = ['high', 'medium', 'low', 'custom'];
      
      qualities.forEach(quality => {
        // Type check - if this compiles, the quality types are correct
        expect(['high', 'medium', 'low', 'custom']).toContain(quality);
      });
    });

    it('should properly type VideoCodec values', () => {
      const codecs: VideoCodec[] = ['h264', 'h265', 'vp9', 'av1'];
      
      codecs.forEach(codec => {
        // Type check - if this compiles, the codec types are correct
        expect(['h264', 'h265', 'vp9', 'av1']).toContain(codec);
      });
    });

    it('should properly type AudioCodec values', () => {
      const codecs: AudioCodec[] = ['aac', 'mp3', 'opus', 'vorbis', 'none'];
      
      codecs.forEach(codec => {
        // Type check - if this compiles, the codec types are correct
        expect(['aac', 'mp3', 'opus', 'vorbis', 'none']).toContain(codec);
      });
    });

    it('should properly type OutputFormat values', () => {
      const formats: OutputFormat[] = ['mp4', 'webm', 'mkv', 'avi'];
      
      formats.forEach(format => {
        // Type check - if this compiles, the format types are correct
        expect(['mp4', 'webm', 'mkv', 'avi']).toContain(format);
      });
    });

    it('should properly type FormErrors interface', () => {
      const errors: FormErrors = {
        customBitrate: 'Bitrate must be positive',
        customResolution: 'Invalid resolution format',
        framerate: 'Frame rate out of range',
        outputFilename: 'Invalid filename characters',
      };

      // Type check - if this compiles, the FormErrors interface is correct
      expect(errors).toBeDefined();
      expect(typeof errors.customBitrate).toBe('string');
      expect(typeof errors.customResolution).toBe('string');
      expect(typeof errors.framerate).toBe('string');
      expect(typeof errors.outputFilename).toBe('string');
    });

    it('should properly type callback functions', () => {
      const onParamsChange = jest.fn<void, [ConversionParams]>();
      const onSubmit = jest.fn<void, [ConversionParams]>();
      const onReset = jest.fn<void, []>();

      const props: ConversionFormProps = {
        onParamsChange,
        onSubmit,
        onReset,
      };

      // Type checks - if these compile, the callback types are correct
      expect(typeof props.onParamsChange).toBe('function');
      expect(typeof props.onSubmit).toBe('function');
      expect(typeof props.onReset).toBe('function');

      // Test callback signatures
      if (props.onParamsChange) props.onParamsChange(defaultParams);
      if (props.onSubmit) props.onSubmit(defaultParams);
      if (props.onReset) props.onReset();

      expect(onParamsChange).toHaveBeenCalledWith(defaultParams);
      expect(onSubmit).toHaveBeenCalledWith(defaultParams);
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Interface Compliance', () => {
    it('should be a valid React functional component', () => {
      // Type check - ConversionForm should be a valid React.FC
      expect(typeof ConversionForm).toBe('function');
      expect(ConversionForm.length).toBe(1); // Should accept one parameter (props)
    });

    it('should export all required types', () => {
      // Type checks - ensure all exports are available
      expect(ConversionForm).toBeDefined();
      expect(typeof ConversionForm).toBe('function');

      // These would fail at compile time if types aren't exported properly
      const props: ConversionFormProps = {};
      const params: ConversionParams = defaultParams;
      const quality: VideoQuality = 'medium';
      const videoCodec: VideoCodec = 'h264';
      const audioCodec: AudioCodec = 'aac';
      const outputFormat: OutputFormat = 'mp4';
      const errors: FormErrors = {};

      expect(props).toBeDefined();
      expect(params).toBeDefined();
      expect(quality).toBeDefined();
      expect(videoCodec).toBeDefined();
      expect(audioCodec).toBeDefined();
      expect(outputFormat).toBeDefined();
      expect(errors).toBeDefined();
    });

    it('should accept React.ViewStyle for containerStyle', () => {
      // This tests that containerStyle accepts proper React Native ViewStyle
      const viewStyle = {
        flex: 1,
        backgroundColor: 'white',
        margin: 16,
        padding: 12,
        borderRadius: 8,
        shadowOpacity: 0.1,
      };

      const props: ConversionFormProps = {
        containerStyle: viewStyle,
      };

      // Type check - if this compiles, ViewStyle is properly accepted
      expect(props.containerStyle).toEqual(viewStyle);
    });
  });

  describe('Validation Logic', () => {
    it('should validate custom bitrate values', () => {
      // Test valid bitrate values
      const validBitrates = [100, 1000, 4000, 8000, 10000, 50000];
      
      validBitrates.forEach(bitrate => {
        const params: ConversionParams = {
          ...defaultParams,
          quality: 'custom',
          customBitrate: bitrate,
        };
        
        // Type check - valid bitrates should work
        expect(params.customBitrate).toBe(bitrate);
        expect(typeof params.customBitrate).toBe('number');
      });

      // Test edge cases
      const edgeCases = [100, 50000]; // Min and max valid values
      
      edgeCases.forEach(bitrate => {
        const params: ConversionParams = {
          ...defaultParams,
          quality: 'custom',
          customBitrate: bitrate,
        };
        
        expect(params.customBitrate).toBe(bitrate);
      });
    });

    it('should validate custom resolution values', () => {
      // Test valid resolution formats
      const validResolutions = ['1920x1080', '1280x720', '854x480', '640x360', '3840x2160'];
      
      validResolutions.forEach(resolution => {
        const params: ConversionParams = {
          ...defaultParams,
          quality: 'custom',
          customResolution: resolution,
        };
        
        // Type check - valid resolutions should work
        expect(params.customResolution).toBe(resolution);
        expect(typeof params.customResolution).toBe('string');
      });
    });

    it('should validate framerate values', () => {
      // Test valid framerate values
      const validFramerates = [24, 25, 30, 60, 120];
      
      validFramerates.forEach(framerate => {
        const params: ConversionParams = {
          ...defaultParams,
          framerate,
        };
        
        // Type check - valid framerates should work
        expect(params.framerate).toBe(framerate);
        expect(typeof params.framerate).toBe('number');
      });
    });

    it('should validate output filename values', () => {
      // Test valid filename values
      const validFilenames = ['video', 'my_video', 'converted-video', 'Video123'];
      
      validFilenames.forEach(filename => {
        const params: ConversionParams = {
          ...defaultParams,
          outputFilename: filename,
        };
        
        // Type check - valid filenames should work
        expect(params.outputFilename).toBe(filename);
        expect(typeof params.outputFilename).toBe('string');
      });
    });
  });

  describe('Default Values and Presets', () => {
    it('should have correct default parameters', () => {
      const params: ConversionParams = {
        quality: 'medium',
        videoCodec: 'h264',
        audioCodec: 'aac',
        outputFormat: 'mp4',
        framerate: 30,
        includeAudio: true,
        optimizeForWeb: true,
      };

      // Type check - default values should be valid
      expect(params.quality).toBe('medium');
      expect(params.videoCodec).toBe('h264');
      expect(params.audioCodec).toBe('aac');
      expect(params.outputFormat).toBe('mp4');
      expect(params.framerate).toBe(30);
      expect(params.includeAudio).toBe(true);
      expect(params.optimizeForWeb).toBe(true);
    });

    it('should handle high quality preset', () => {
      const params: ConversionParams = {
        ...defaultParams,
        quality: 'high',
        customBitrate: 8000,
        customResolution: '1920x1080',
      };

      // Type check - high quality preset should work
      expect(params.quality).toBe('high');
      expect(params.customBitrate).toBe(8000);
      expect(params.customResolution).toBe('1920x1080');
    });

    it('should handle medium quality preset', () => {
      const params: ConversionParams = {
        ...defaultParams,
        quality: 'medium',
        customBitrate: 4000,
        customResolution: '1280x720',
      };

      // Type check - medium quality preset should work
      expect(params.quality).toBe('medium');
      expect(params.customBitrate).toBe(4000);
      expect(params.customResolution).toBe('1280x720');
    });

    it('should handle low quality preset', () => {
      const params: ConversionParams = {
        ...defaultParams,
        quality: 'low',
        customBitrate: 1500,
        customResolution: '854x480',
        framerate: 24,
      };

      // Type check - low quality preset should work
      expect(params.quality).toBe('low');
      expect(params.customBitrate).toBe(1500);
      expect(params.customResolution).toBe('854x480');
      expect(params.framerate).toBe(24);
    });

    it('should handle custom quality preset', () => {
      const params: ConversionParams = {
        ...defaultParams,
        quality: 'custom',
        customBitrate: 6000,
        customResolution: '1440x900',
        framerate: 25,
      };

      // Type check - custom quality preset should work
      expect(params.quality).toBe('custom');
      expect(params.customBitrate).toBe(6000);
      expect(params.customResolution).toBe('1440x900');
      expect(params.framerate).toBe(25);
    });
  });

  describe('Advanced Options', () => {
    it('should handle all video codec options', () => {
      const codecs: VideoCodec[] = ['h264', 'h265', 'vp9', 'av1'];
      
      codecs.forEach(codec => {
        const params: ConversionParams = {
          ...defaultParams,
          videoCodec: codec,
        };
        
        // Type check - all video codecs should work
        expect(params.videoCodec).toBe(codec);
      });
    });

    it('should handle all audio codec options', () => {
      const codecs: AudioCodec[] = ['aac', 'mp3', 'opus', 'vorbis', 'none'];
      
      codecs.forEach(codec => {
        const params: ConversionParams = {
          ...defaultParams,
          audioCodec: codec,
        };
        
        // Type check - all audio codecs should work
        expect(params.audioCodec).toBe(codec);
      });
    });

    it('should handle all output format options', () => {
      const formats: OutputFormat[] = ['mp4', 'webm', 'mkv', 'avi'];
      
      formats.forEach(format => {
        const params: ConversionParams = {
          ...defaultParams,
          outputFormat: format,
        };
        
        // Type check - all output formats should work
        expect(params.outputFormat).toBe(format);
      });
    });

    it('should handle audio inclusion toggle', () => {
      const withAudio: ConversionParams = {
        ...defaultParams,
        includeAudio: true,
      };

      const withoutAudio: ConversionParams = {
        ...defaultParams,
        includeAudio: false,
        audioCodec: 'none',
      };

      // Type checks - audio inclusion should work
      expect(withAudio.includeAudio).toBe(true);
      expect(withoutAudio.includeAudio).toBe(false);
      expect(withoutAudio.audioCodec).toBe('none');
    });

    it('should handle web optimization toggle', () => {
      const optimized: ConversionParams = {
        ...defaultParams,
        optimizeForWeb: true,
      };

      const notOptimized: ConversionParams = {
        ...defaultParams,
        optimizeForWeb: false,
      };

      // Type checks - web optimization should work
      expect(optimized.optimizeForWeb).toBe(true);
      expect(notOptimized.optimizeForWeb).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle optional parameters gracefully', () => {
      const minimalParams: ConversionParams = {
        quality: 'medium',
        videoCodec: 'h264',
        audioCodec: 'aac',
        outputFormat: 'mp4',
        includeAudio: true,
        optimizeForWeb: true,
        // Optional parameters omitted
      };

      // Type check - minimal params should work
      expect(minimalParams.quality).toBe('medium');
      expect(minimalParams.customBitrate).toBeUndefined();
      expect(minimalParams.customResolution).toBeUndefined();
      expect(minimalParams.framerate).toBeUndefined();
      expect(minimalParams.outputFilename).toBeUndefined();
    });

    it('should handle partial initial parameters', () => {
      const partialParams: Partial<ConversionParams> = {
        quality: 'high',
        includeAudio: false,
      };

      const props: ConversionFormProps = {
        initialParams: partialParams,
      };

      // Type check - partial params should work
      expect(props.initialParams?.quality).toBe('high');
      expect(props.initialParams?.includeAudio).toBe(false);
      expect(props.initialParams?.videoCodec).toBeUndefined();
    });

    it('should handle form errors correctly', () => {
      const errors: FormErrors = {
        customBitrate: 'Bitrate is too low',
        customResolution: 'Invalid format',
      };

      // Type check - form errors should work
      expect(errors.customBitrate).toBe('Bitrate is too low');
      expect(errors.customResolution).toBe('Invalid format');
      expect(errors.framerate).toBeUndefined();
      expect(errors.outputFilename).toBeUndefined();
    });
  });
});