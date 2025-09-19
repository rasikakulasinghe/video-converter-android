import { FileCard, FileCardProps, VideoFileMetadata, FileCardState } from '../FileCard';

describe('FileCard', () => {
  const mockVideoFile: VideoFileMetadata = {
    filename: 'test-video.mov',
    size: 104857600, // 100MB
    duration: 120, // 2 minutes
    resolution: '1920x1080',
    codec: 'H.264',
    bitrate: 8000,
    framerate: 30,
    format: 'MOV',
    path: '/storage/test-video.mov',
    createdAt: new Date('2023-10-01T12:00:00Z'),
    hasAudio: true,
    audioCodec: 'AAC',
  };

  describe('Type Safety and Interfaces', () => {
    it('should accept all required props without TypeScript errors', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
      };
      
      // Type check - if this compiles, the types are correct
      expect(props).toBeDefined();
      expect(props.file).toBeDefined();
      expect(props.state).toBe('normal');
    });

    it('should accept all optional props without TypeScript errors', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'selected',
        showDetails: true,
        selectable: true,
        showActions: true,
        thumbnailUri: 'http://example.com/thumb.jpg',
        onPress: jest.fn(),
        onRemove: jest.fn(),
        onInfo: jest.fn(),
        onPreview: jest.fn(),
        containerStyle: { margin: 10 },
        testID: 'custom-test-id',
        accessibilityLabel: 'Custom accessibility label',
      };
      
      // Type check - if this compiles, the types are correct
      expect(props).toBeDefined();
      expect(props.showDetails).toBe(true);
      expect(props.selectable).toBe(true);
      expect(props.showActions).toBe(true);
      expect(props.thumbnailUri).toBe('http://example.com/thumb.jpg');
      expect(typeof props.onPress).toBe('function');
      expect(typeof props.onRemove).toBe('function');
      expect(typeof props.onInfo).toBe('function');
      expect(typeof props.onPreview).toBe('function');
      expect(props.containerStyle).toEqual({ margin: 10 });
      expect(props.testID).toBe('custom-test-id');
      expect(props.accessibilityLabel).toBe('Custom accessibility label');
    });

    it('should properly type VideoFileMetadata interface', () => {
      const videoFile: VideoFileMetadata = {
        filename: 'video.mp4',
        size: 1024,
        duration: 60,
        resolution: '1280x720',
        codec: 'H.265',
        bitrate: 5000,
        framerate: 24,
        format: 'MP4',
        path: '/path/to/video.mp4',
        createdAt: new Date(),
        hasAudio: false,
      };

      // Type check - if this compiles, the interface is correct
      expect(videoFile).toBeDefined();
      expect(videoFile.filename).toBe('video.mp4');
      expect(videoFile.size).toBe(1024);
      expect(videoFile.duration).toBe(60);
      expect(videoFile.resolution).toBe('1280x720');
      expect(videoFile.codec).toBe('H.265');
      expect(videoFile.bitrate).toBe(5000);
      expect(videoFile.framerate).toBe(24);
      expect(videoFile.format).toBe('MP4');
      expect(videoFile.path).toBe('/path/to/video.mp4');
      expect(videoFile.createdAt).toBeInstanceOf(Date);
      expect(videoFile.hasAudio).toBe(false);
    });

    it('should properly type FileCardState values', () => {
      const states: FileCardState[] = ['normal', 'selected', 'disabled', 'processing'];
      
      states.forEach(state => {
        // Type check - if this compiles, the state types are correct
        expect(['normal', 'selected', 'disabled', 'processing']).toContain(state);
      });
    });

    it('should require file and state props', () => {
      // TypeScript should catch these at compile time
      // These tests verify the interface structure
      const fileCardProps: Required<Pick<FileCardProps, 'file' | 'state'>> = {
        file: mockVideoFile,
        state: 'normal',
      };

      expect(fileCardProps).toBeDefined();
      expect(fileCardProps.file).toBeDefined();
      expect(fileCardProps.state).toBeDefined();
    });

    it('should accept optional VideoFileMetadata properties', () => {
      const videoFileWithOptional: VideoFileMetadata = {
        ...mockVideoFile,
        audioCodec: 'MP3', // Optional property
      };

      const videoFileWithoutOptional: VideoFileMetadata = {
        filename: 'test.mp4',
        size: 1024,
        duration: 60,
        resolution: '720p',
        codec: 'H.264',
        bitrate: 1000,
        framerate: 30,
        format: 'MP4',
        path: '/test.mp4',
        createdAt: new Date(),
        hasAudio: false,
        // audioCodec is optional and omitted
      };

      // Type checks - if these compile, the optional properties work correctly
      expect(videoFileWithOptional.audioCodec).toBe('MP3');
      expect(videoFileWithoutOptional.audioCodec).toBeUndefined();
    });

    it('should properly type callback functions', () => {
      const onPress = jest.fn();
      const onRemove = jest.fn();
      const onInfo = jest.fn();
      const onPreview = jest.fn();

      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        onPress,
        onRemove,
        onInfo,
        onPreview,
      };

      // Type checks - if these compile, the callback types are correct
      expect(typeof props.onPress).toBe('function');
      expect(typeof props.onRemove).toBe('function');
      expect(typeof props.onInfo).toBe('function');
      expect(typeof props.onPreview).toBe('function');

      // Ensure callbacks have correct signatures
      if (props.onPress) props.onPress();
      if (props.onRemove) props.onRemove();
      if (props.onInfo) props.onInfo();
      if (props.onPreview) props.onPreview();

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onInfo).toHaveBeenCalledTimes(1);
      expect(onPreview).toHaveBeenCalledTimes(1);
    });

    it('should properly type style properties', () => {
      const containerStyle = {
        margin: 10,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 8,
      };

      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        containerStyle,
      };

      // Type check - if this compiles, the style types are correct
      expect(props.containerStyle).toEqual(containerStyle);
      expect(props.containerStyle?.margin).toBe(10);
      expect(props.containerStyle?.padding).toBe(20);
      expect(props.containerStyle?.backgroundColor).toBe('#ffffff');
      expect(props.containerStyle?.borderRadius).toBe(8);
    });

    it('should properly type boolean flags', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        showDetails: true,
        selectable: false,
        showActions: true,
      };

      // Type checks - if these compile, the boolean types are correct
      expect(typeof props.showDetails).toBe('boolean');
      expect(typeof props.selectable).toBe('boolean');
      expect(typeof props.showActions).toBe('boolean');
      expect(props.showDetails).toBe(true);
      expect(props.selectable).toBe(false);
      expect(props.showActions).toBe(true);
    });

    it('should properly type string properties', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        thumbnailUri: 'https://example.com/thumb.jpg',
        testID: 'file-card-test',
        accessibilityLabel: 'Video file card',
      };

      // Type checks - if these compile, the string types are correct
      expect(typeof props.thumbnailUri).toBe('string');
      expect(typeof props.testID).toBe('string');
      expect(typeof props.accessibilityLabel).toBe('string');
      expect(props.thumbnailUri).toBe('https://example.com/thumb.jpg');
      expect(props.testID).toBe('file-card-test');
      expect(props.accessibilityLabel).toBe('Video file card');
    });
  });

  describe('Component Interface Compliance', () => {
    it('should be a valid React functional component', () => {
      // Type check - FileCard should be a valid React.FC
      expect(typeof FileCard).toBe('function');
      expect(FileCard.length).toBe(1); // Should accept one parameter (props)
    });

    it('should export all required types', () => {
      // Type checks - ensure all exports are available
      expect(FileCard).toBeDefined();
      expect(typeof FileCard).toBe('function');

      // These would fail at compile time if types aren't exported properly
      const props: FileCardProps = { file: mockVideoFile, state: 'normal' };
      const videoFile: VideoFileMetadata = mockVideoFile;
      const state: FileCardState = 'normal';

      expect(props).toBeDefined();
      expect(videoFile).toBeDefined();
      expect(state).toBeDefined();
    });

    it('should accept React.ViewStyle for containerStyle', () => {
      // This tests that containerStyle accepts proper React Native ViewStyle
      const viewStyle = {
        flex: 1,
        backgroundColor: 'red',
        margin: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: 'blue',
        borderRadius: 8,
        opacity: 0.8,
        transform: [{ scale: 1.1 }],
      };

      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        containerStyle: viewStyle,
      };

      // Type check - if this compiles, ViewStyle is properly accepted
      expect(props.containerStyle).toEqual(viewStyle);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle minimal VideoFileMetadata', () => {
      const minimalFile: VideoFileMetadata = {
        filename: 'test.mp4',
        size: 1024,
        duration: 60,
        resolution: '720p',
        codec: 'H.264',
        bitrate: 1000,
        framerate: 30,
        format: 'MP4',
        path: '/test.mp4',
        createdAt: new Date(),
        hasAudio: false,
      };

      const props: FileCardProps = {
        file: minimalFile,
        state: 'normal',
      };

      // Type check - minimal file should work
      expect(props.file).toEqual(minimalFile);
      expect(props.file.audioCodec).toBeUndefined();
    });

    it('should handle all FileCardState values', () => {
      const states: FileCardState[] = ['normal', 'selected', 'disabled', 'processing'];
      
      states.forEach(state => {
        const props: FileCardProps = {
          file: mockVideoFile,
          state,
        };
        
        // Type check - all states should be valid
        expect(props.state).toBe(state);
      });
    });

    it('should handle different file formats', () => {
      const formats = ['MP4', 'AVI', 'MKV', 'WMV', 'MOV', 'WEBM', 'OGV'];
      
      formats.forEach(format => {
        const file: VideoFileMetadata = {
          ...mockVideoFile,
          format,
        };
        
        const props: FileCardProps = {
          file,
          state: 'normal',
        };
        
        // Type check - different formats should work
        expect(props.file.format).toBe(format);
      });
    });
  });
});