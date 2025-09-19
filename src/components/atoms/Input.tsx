import React, { useState, useCallback } from 'react';
import { TextInput, View, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';

/**
 * Input variant types for different use cases
 */
export type InputVariant = 'default' | 'outline' | 'filled';

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Input validation state types
 */
export type InputState = 'default' | 'error' | 'success' | 'warning';

/**
 * Input component props interface
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label text */
  label?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Help text displayed below the input */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Warning message to display */
  warningMessage?: string;
  /** Visual variant of the input */
  variant?: InputVariant;
  /** Size of the input */
  size?: InputSize;
  /** Validation state of the input */
  state?: InputState;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is required */
  required?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  /** Whether to show/hide password (for password inputs) */
  showPassword?: boolean;
  /** Callback when show/hide password is toggled */
  onTogglePassword?: () => void;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom input style */
  inputStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// Design system colors
const colors = {
  primary: '#2f6690',
  primaryLight: '#81c3d7',
  secondary: '#6b7280',
  border: '#d1d5db',
  borderFocus: '#2f6690',
  background: '#ffffff',
  backgroundDisabled: '#f3f4f6',
  text: '#111827',
  textSecondary: '#6b7280',
  textDisabled: '#9ca3af',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
};

/**
 * Get input container styles based on variant, size, state, and focus
 */
const getContainerStyles = (
  variant: InputVariant,
  size: InputSize,
  state: InputState,
  focused: boolean,
  disabled: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  };

  // Size styles
  const sizeStyles: Record<InputSize, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
    md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
    lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
  };

  // Variant and state styles
  let borderColor = colors.border;
  let backgroundColor = colors.background;

  if (disabled) {
    backgroundColor = colors.backgroundDisabled;
    borderColor = colors.border;
  } else if (state === 'error') {
    borderColor = colors.error;
  } else if (state === 'success') {
    borderColor = colors.success;
  } else if (state === 'warning') {
    borderColor = colors.warning;
  } else if (focused) {
    borderColor = colors.borderFocus;
  }

  const variantStyles: Record<InputVariant, ViewStyle> = {
    default: {
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      backgroundColor: 'transparent',
    },
    outline: {
      borderWidth: 1,
      borderColor,
      backgroundColor,
    },
    filled: {
      backgroundColor: disabled ? colors.backgroundDisabled : colors.backgroundDisabled,
      borderWidth: 0,
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

/**
 * Get input text styles based on size and disabled state
 */
const getInputStyles = (size: InputSize, disabled: boolean): TextStyle => {
  const baseStyle: TextStyle = {
    flex: 1,
    color: disabled ? colors.textDisabled : colors.text,
    fontFamily: 'System',
  };

  const sizeStyles: Record<InputSize, TextStyle> = {
    sm: { fontSize: 14, lineHeight: 20 },
    md: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
  };
};

/**
 * Get message text color based on input state
 */
const getMessageColor = (state: InputState): string => {
  switch (state) {
    case 'error':
      return colors.error;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    default:
      return colors.textSecondary;
  }
};

/**
 * Input atom component
 * 
 * A flexible input component with support for various states, validation,
 * icons, and accessibility features following Material Design principles.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   variant="outline"
 *   size="md"
 *   required
 *   startIcon={<Icon name="info" size="sm" />}
 * />
 * 
 * <Input
 *   label="Password"
 *   placeholder="Enter password"
 *   secureTextEntry={!showPassword}
 *   state="error"
 *   errorMessage="Password is required"
 *   endIcon={
 *     <Icon 
 *       name={showPassword ? "close" : "info"} 
 *       size="sm" 
 *       onPress={togglePassword}
 *     />
 *   }
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  variant = 'outline',
  size = 'md',
  state = 'default',
  disabled = false,
  required = false,
  startIcon,
  endIcon,
  showPassword,
  onTogglePassword,
  containerStyle,
  inputStyle,
  testID,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  // Determine actual state based on messages
  let actualState = state;
  if (errorMessage) actualState = 'error';
  else if (successMessage) actualState = 'success';
  else if (warningMessage) actualState = 'warning';

  // Get the message to display
  const message = errorMessage || successMessage || warningMessage || helperText;

  const handleFocus = useCallback((event: any) => {
    setFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: any) => {
    setFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  const containerStyles = getContainerStyles(variant, size, actualState, focused, disabled);
  const textInputStyles = getInputStyles(size, disabled);
  const messageColor = getMessageColor(actualState);

  return (
    <View style={containerStyle} testID={testID}>
      {/* Label */}
      {label && (
        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Text
            variant="body-small"
            weight="medium"
            color={disabled ? 'muted' : 'primary'}
          >
            {label}
          </Text>
          {required && (
            <Text
              variant="body-small"
              color="error"
              style={{ marginLeft: 4 }}
            >
              *
            </Text>
          )}
        </View>
      )}

      {/* Input Container */}
      <View style={containerStyles}>
        {/* Start Icon */}
        {startIcon && (
          <View style={{ marginRight: 12 }}>
            {startIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[textInputStyles, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityRole="text"
          accessibilityState={{ disabled }}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          {...props}
        />

        {/* End Icon */}
        {endIcon && (
          <View style={{ marginLeft: 12 }}>
            {endIcon}
          </View>
        )}

        {/* Password Toggle */}
        {props.secureTextEntry && onTogglePassword && (
          <View style={{ marginLeft: 12 }}>
            <Icon
              name={showPassword ? 'close' : 'info'}
              size="sm"
              color="secondary"
              // Note: onPress would need to be handled by wrapping in Pressable
            />
          </View>
        )}
      </View>

      {/* Message */}
      {message && (
        <View style={{ marginTop: 8 }}>
          <Text
            variant="caption"
            style={{ color: messageColor }}
          >
            {message}
          </Text>
        </View>
      )}
    </View>
  );
};