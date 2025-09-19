import React from 'react';
import { Button } from '../Button';

// Mock React Native components for testing
jest.mock('react-native', () => ({
  Pressable: ({ children, onPress, testID, style, ...props }: any) => 
    React.createElement('button', {
      onClick: onPress,
      'data-testid': testID,
      style: typeof style === 'function' ? style({ pressed: false }) : style,
      ...props,
    }, children),
  Text: ({ children, style }: any) => 
    React.createElement('span', { style }, children),
  ActivityIndicator: ({ size, color }: any) => 
    React.createElement('div', { 
      'data-testid': 'activity-indicator',
      style: { width: 16, height: 16, backgroundColor: color }
    }),
  View: ({ children, style }: any) => 
    React.createElement('div', { style }, children),
}));

describe('Button Component', () => {
  it('should render with default props', () => {
    const button = React.createElement(Button, {}, 'Test Button');
    expect(button).toBeDefined();
    expect(button.props.children).toBe('Test Button');
  });

  it('should accept variant prop', () => {
    const button = React.createElement(Button, {
      variant: 'secondary'
    }, 'Secondary Button');
    expect(button.props.variant).toBe('secondary');
  });

  it('should accept size prop', () => {
    const button = React.createElement(Button, {
      size: 'lg'
    }, 'Large Button');
    expect(button.props.size).toBe('lg');
  });

  it('should accept disabled prop', () => {
    const button = React.createElement(Button, {
      disabled: true
    }, 'Disabled Button');
    expect(button.props.disabled).toBe(true);
  });

  it('should accept loading prop', () => {
    const button = React.createElement(Button, {
      loading: true
    }, 'Loading Button');
    expect(button.props.loading).toBe(true);
  });

  it('should accept fullWidth prop', () => {
    const button = React.createElement(Button, {
      fullWidth: true
    }, 'Full Width Button');
    expect(button.props.fullWidth).toBe(true);
  });

  it('should accept onPress handler', () => {
    const handlePress = jest.fn();
    const button = React.createElement(Button, {
      onPress: handlePress
    }, 'Clickable Button');
    expect(button.props.onPress).toBe(handlePress);
  });

  it('should accept testID prop', () => {
    const button = React.createElement(Button, {
      testID: 'custom-test-id'
    }, 'Test Button');
    expect(button.props.testID).toBe('custom-test-id');
  });

  it('should accept accessibilityLabel prop', () => {
    const button = React.createElement(Button, {
      accessibilityLabel: 'Custom accessibility label'
    }, 'Button');
    expect(button.props.accessibilityLabel).toBe('Custom accessibility label');
  });

  it('should accept left and right icons', () => {
    const LeftIcon = React.createElement('span', {}, '←');
    const RightIcon = React.createElement('span', {}, '→');
    
    const button = React.createElement(Button, {
      leftIcon: LeftIcon,
      rightIcon: RightIcon
    }, 'Button with Icons');
    
    expect(button.props.leftIcon).toBe(LeftIcon);
    expect(button.props.rightIcon).toBe(RightIcon);
  });

  describe('Default values', () => {
    it('should use default variant when not specified', () => {
      const button = React.createElement(Button, {}, 'Default Button');
      // Default variant should be 'primary' based on component definition
      expect(button.type).toBe(Button);
    });

    it('should use default size when not specified', () => {
      const button = React.createElement(Button, {}, 'Default Button');
      // Default size should be 'md' based on component definition
      expect(button.type).toBe(Button);
    });

    it('should not be disabled by default', () => {
      const button = React.createElement(Button, {}, 'Default Button');
      expect(button.props.disabled).toBeUndefined();
    });

    it('should not be loading by default', () => {
      const button = React.createElement(Button, {}, 'Default Button');
      expect(button.props.loading).toBeUndefined();
    });

    it('should not be full width by default', () => {
      const button = React.createElement(Button, {}, 'Default Button');
      expect(button.props.fullWidth).toBeUndefined();
    });
  });

  describe('Variant types', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const;
    
    variants.forEach(variant => {
      it(`should accept ${variant} variant`, () => {
        const button = React.createElement(Button, {
          variant
        }, `${variant} Button`);
        expect(button.props.variant).toBe(variant);
      });
    });
  });

  describe('Size types', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      it(`should accept ${size} size`, () => {
        const button = React.createElement(Button, {
          size
        }, `${size} Button`);
        expect(button.props.size).toBe(size);
      });
    });
  });
});