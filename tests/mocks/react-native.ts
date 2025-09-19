import React from 'react';

// Create React Native Testing Library compatible mock components
const createMockComponent = (name: string) => {
  const Component = React.forwardRef<any, any>((props: any, ref) => {
    const { children, style, onPress, disabled, testID, accessibilityRole, accessibilityLabel, accessibilityState, ...restProps } = props;
    
    // Handle different component types with proper attributes
    const elementProps: any = { ...restProps };
    
    if (testID) elementProps['data-testid'] = testID;
    if (accessibilityRole) elementProps.role = accessibilityRole;
    if (accessibilityLabel) elementProps['aria-label'] = accessibilityLabel;
    if (accessibilityState?.disabled) elementProps['aria-disabled'] = 'true';
    if (disabled) elementProps.disabled = true;
    if (onPress) elementProps.onClick = onPress;
    if (style) elementProps.style = style;
    if (ref) elementProps.ref = ref;

    return React.createElement(
      name.toLowerCase() === 'pressable' ? 'button' : name.toLowerCase(),
      elementProps,
      children
    );
  });
  Component.displayName = name;
  return Component;
};

// Mock React Native components with proper web element mapping
export const Pressable = createMockComponent('Pressable');
export const Text = createMockComponent('Text');
export const TextInput = createMockComponent('TextInput');
export const View = createMockComponent('View');
export const ActivityIndicator = createMockComponent('ActivityIndicator');
export const ScrollView = createMockComponent('ScrollView');
export const Switch = createMockComponent('Switch');
export const Alert = {
  alert: jest.fn(),
};

// Mock Platform
export const Platform = {
  OS: 'android' as const,
  Version: 33,
  select: (options: any) => options.android || options.default,
  isTV: false,
  isPad: false,
  constants: {},
};

// Mock AppState with proper cleanup
export const AppState = {
  currentState: 'active' as const,
  addEventListener: jest.fn(() => {
    // Return cleanup function
    return {
      remove: jest.fn(),
    };
  }),
  removeEventListener: jest.fn(),
  isAvailable: true,
};

// Mock StyleSheet
export const StyleSheet = {
  create: (styles: any) => styles,
};

// Mock Animated API
export const Animated = {
  View: createMockComponent('AnimatedView'),
  Value: class {
    constructor(private _value: number) {}
    setValue(value: number) {
      this._value = value;
    }
    interpolate() {
      return 'mocked-interpolation';
    }
  },
  timing: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  loop: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  sequence: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
};

// Mock types
export interface PressableProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  children?: any;
  testID?: string;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityState?: any;
}

export interface TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  style?: any;
  testID?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: any;
  placeholderTextColor?: string;
}

export interface ScrollViewProps {
  children?: React.ReactNode;
  style?: any;
}

export interface SwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

export interface ViewStyle {
  [key: string]: any;
}

export interface TextStyle {
  [key: string]: any;
}