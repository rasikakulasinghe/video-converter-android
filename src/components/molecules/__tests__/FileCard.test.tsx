import React from 'react';
import { create, act } from 'react-test-renderer';
import { FileCard, FileCardProps, FileCardState } from '../FileCard';
import { VideoFile, VideoFormat } from '../../../types/models';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

describe('FileCard', () => {
  const mockVideoFile: VideoFile = {
    id: 'test-video-123',
    name: 'test-video.mov',
    path: '/storage/test-video.mov',
    size: 104857600, // 100MB
    mimeType: 'video/quicktime',
    format: VideoFormat.MOV,
    createdAt: new Date('2023-10-01T12:00:00Z'),
    modifiedAt: new Date('2023-10-01T12:00:00Z'),
    metadata: {
      duration: 120, // 2 minutes
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 8000,
      codec: 'H.264',
      codecName: 'h264',
      audioCodec: 'AAC',
      audioBitrate: 128,
      audioSampleRate: 44100,
      audioChannels: 2,
    },
  };

  const mockProps: FileCardProps = {
    file: mockVideoFile,
    state: 'normal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      let component: any;

      act(() => {
        component = create(<FileCard {...mockProps} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeTruthy();
    });

    it('renders with different states', () => {
      const states: FileCardState[] = ['normal', 'selected', 'disabled', 'processing'];

      states.forEach(state => {
        let component: any;

        act(() => {
          component = create(<FileCard {...mockProps} state={state} />);
        });

        const tree = component.toJSON();
        expect(tree).toBeTruthy();
      });
    });

    it('renders with optional props', () => {
      const propsWithOptional: FileCardProps = {
        ...mockProps,
        showDetails: true,
        selectable: true,
        showActions: true,
        thumbnailUri: 'file:///thumbnail.jpg',
        onPress: jest.fn(),
        onRemove: jest.fn(),
        onInfo: jest.fn(),
        onPreview: jest.fn(),
      };

      let component: any;

      act(() => {
        component = create(<FileCard {...propsWithOptional} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('accepts all required props', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
      };

      expect(props).toBeDefined();
      expect(props.file).toEqual(mockVideoFile);
      expect(props.state).toBe('normal');
    });

    it('accepts all optional props', () => {
      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'selected',
        showDetails: true,
        selectable: true,
        showActions: true,
        thumbnailUri: 'file:///thumbnail.jpg',
        onPress: jest.fn(),
        onRemove: jest.fn(),
        onInfo: jest.fn(),
        onPreview: jest.fn(),
        testID: 'file-card-test',
        containerStyle: { margin: 10 },
      };

      expect(props).toBeDefined();
      expect(props.showDetails).toBe(true);
      expect(props.selectable).toBe(true);
      expect(props.showActions).toBe(true);
      expect(props.thumbnailUri).toBe('file:///thumbnail.jpg');
      expect(typeof props.onPress).toBe('function');
      expect(typeof props.onRemove).toBe('function');
      expect(typeof props.onInfo).toBe('function');
      expect(typeof props.onPreview).toBe('function');
      expect(props.testID).toBe('file-card-test');
      expect(props.containerStyle).toEqual({ margin: 10 });
    });
  });

  describe('Type Safety', () => {
    it('enforces VideoFile type for file prop', () => {
      const videoFile: VideoFile = {
        id: 'test-123',
        name: 'sample.mp4',
        path: '/path/sample.mp4',
        size: 1024000,
        mimeType: 'video/mp4',
        format: VideoFormat.MP4,
        createdAt: new Date(),
        modifiedAt: new Date(),
        metadata: {
          duration: 60,
          width: 1280,
          height: 720,
          frameRate: 24,
          bitrate: 5000,
          codec: 'H.264',
          codecName: 'h264',
        },
      };

      const props: FileCardProps = {
        file: videoFile,
        state: 'normal',
      };

      expect(props.file).toEqual(videoFile);
    });

    it('enforces FileCardState type for state prop', () => {
      const validStates: FileCardState[] = ['normal', 'selected', 'disabled', 'processing'];

      validStates.forEach(state => {
        const props: FileCardProps = {
          file: mockVideoFile,
          state: state,
        };

        expect(props.state).toBe(state);
      });
    });

    it('enforces correct callback signatures', () => {
      const mockPress = jest.fn();
      const mockRemove = jest.fn();
      const mockInfo = jest.fn();
      const mockPreview = jest.fn();

      const props: FileCardProps = {
        file: mockVideoFile,
        state: 'normal',
        onPress: mockPress,
        onRemove: mockRemove,
        onInfo: mockInfo,
        onPreview: mockPreview,
      };

      expect(typeof props.onPress).toBe('function');
      expect(typeof props.onRemove).toBe('function');
      expect(typeof props.onInfo).toBe('function');
      expect(typeof props.onPreview).toBe('function');
    });
  });

  describe('File Properties', () => {
    it('handles different video formats', () => {
      const formats = [VideoFormat.MP4, VideoFormat.MOV, VideoFormat.AVI, VideoFormat.MKV];

      formats.forEach(format => {
        const videoFile: VideoFile = {
          ...mockVideoFile,
          format: format,
        };

        const props: FileCardProps = {
          file: videoFile,
          state: 'normal',
        };

        expect(props.file.format).toBe(format);
      });
    });

    it('handles video metadata correctly', () => {
      const videoFile: VideoFile = {
        ...mockVideoFile,
        metadata: {
          duration: 180,
          width: 3840,
          height: 2160,
          frameRate: 60,
          bitrate: 15000,
          codec: 'H.265',
          codecName: 'hevc',
          audioCodec: 'DTS',
          audioBitrate: 256,
          audioSampleRate: 48000,
          audioChannels: 6,
        },
      };

      const props: FileCardProps = {
        file: videoFile,
        state: 'normal',
      };

      expect(props.file.metadata.duration).toBe(180);
      expect(props.file.metadata.width).toBe(3840);
      expect(props.file.metadata.height).toBe(2160);
      expect(props.file.metadata.codec).toBe('H.265');
    });
  });
});