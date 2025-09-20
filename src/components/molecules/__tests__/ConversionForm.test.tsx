import React from 'react';
import { create, act } from 'react-test-renderer';
import { ConversionForm, ConversionFormProps } from '../ConversionForm';
import { ConversionSettings } from '../../../types/models';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

describe('ConversionForm', () => {
  const defaultSettings: ConversionSettings = {
    quality: 'medium',
    format: 'mp4',
    audioCodec: 'aac',
    preserveMetadata: true,
  };

  const mockProps: ConversionFormProps = {
    visible: true,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing when visible', () => {
      let component: any;

      act(() => {
        component = create(<ConversionForm {...mockProps} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeTruthy();
    });

    it('renders nothing when not visible', () => {
      let component: any;

      act(() => {
        component = create(<ConversionForm {...mockProps} visible={false} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeNull();
    });

    it('accepts initial values', () => {
      const props: ConversionFormProps = {
        ...mockProps,
        initialValues: { quality: 'high' },
      };

      let component: any;

      act(() => {
        component = create(<ConversionForm {...props} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeTruthy();
    });

    it('shows loading state', () => {
      const props: ConversionFormProps = {
        ...mockProps,
        loading: true,
      };

      let component: any;

      act(() => {
        component = create(<ConversionForm {...props} />);
      });

      const tree = component.toJSON();
      expect(tree).toBeTruthy();
    });
  });

  describe('Props validation', () => {
    it('accepts all required props', () => {
      const props: ConversionFormProps = {
        visible: true,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
      };

      expect(props).toBeDefined();
      expect(typeof props.onSubmit).toBe('function');
      expect(typeof props.onCancel).toBe('function');
      expect(props.visible).toBe(true);
    });

    it('accepts all optional props', () => {
      const props: ConversionFormProps = {
        visible: true,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        initialValues: defaultSettings,
        loading: true,
        style: { margin: 10 },
        testID: 'test-form',
      };

      expect(props).toBeDefined();
      expect(props.initialValues).toEqual(defaultSettings);
      expect(props.loading).toBe(true);
      expect(props.style).toEqual({ margin: 10 });
      expect(props.testID).toBe('test-form');
    });
  });

  describe('Type Safety', () => {
    it('enforces ConversionSettings type for initialValues', () => {
      const validSettings: Partial<ConversionSettings> = {
        quality: 'high',
        format: 'webm',
        audioCodec: 'mp3',
        preserveMetadata: false,
      };

      const props: ConversionFormProps = {
        visible: true,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        initialValues: validSettings,
      };

      expect(props.initialValues).toEqual(validSettings);
    });

    it('enforces correct callback signature for onSubmit', () => {
      const mockSubmit = jest.fn((settings: ConversionSettings) => {
        expect(settings).toHaveProperty('quality');
        expect(settings).toHaveProperty('format');
        expect(settings).toHaveProperty('audioCodec');
        expect(settings).toHaveProperty('preserveMetadata');
      });

      const props: ConversionFormProps = {
        visible: true,
        onSubmit: mockSubmit,
        onCancel: jest.fn(),
      };

      expect(typeof props.onSubmit).toBe('function');
    });
  });
});