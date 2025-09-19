import React, { useCallback } from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps, ViewStyle, TextStyle, View } from 'react-native';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button component props interface
 */
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button text content */
  children: string;
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Optional icon component to render before text */
  leftIcon?: React.ReactNode;
  /** Optional icon component to render after text */
  rightIcon?: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

// Design system colors following Material Design principles
const colors = {
  primary: '#2f6690',
  primaryLight: '#81c3d7',
  primaryDark: '#16425b',
  secondary: '#3a7ca5',
  neutral: '#d9dcd6',
  white: '#ffffff',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    900: '#111827',
  },
  red: {
    600: '#dc2626',
    700: '#b91c1c',
  },
};

/**
 * Get button styles based on variant, size, and state
 */
const getButtonStyles = (
  variant: ButtonVariant, 
  size: ButtonSize, 
  disabled: boolean, 
  fullWidth: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 },
    md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 40 },
    lg: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 48 },
    xl: { paddingHorizontal: 32, paddingVertical: 20, minHeight: 56 },
  };

  // Variant styles
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: disabled 
      ? { backgroundColor: colors.gray[300] }
      : { backgroundColor: colors.primary },
    secondary: disabled
      ? { backgroundColor: colors.gray[200] }
      : { backgroundColor: colors.gray[100] },
    outline: disabled
      ? { borderWidth: 1, borderColor: colors.gray[300], backgroundColor: 'transparent' }
      : { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
    ghost: { backgroundColor: 'transparent' },
    destructive: disabled
      ? { backgroundColor: colors.gray[300] }
      : { backgroundColor: colors.red[600] },
  };

  // Width styles
  const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...widthStyle,
  };
};

/**
 * Get text styles based on variant, size, and state
 */
const getTextStyles = (variant: ButtonVariant, size: ButtonSize, disabled: boolean): TextStyle => {
  const baseStyle: TextStyle = {
    fontWeight: '600',
    textAlign: 'center',
  };

  // Size text styles
  const sizeTextStyles: Record<ButtonSize, TextStyle> = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
    xl: { fontSize: 20 },
  };

  // Variant text colors
  const variantTextStyles: Record<ButtonVariant, TextStyle> = {
    primary: disabled ? { color: colors.gray[500] } : { color: colors.white },
    secondary: disabled ? { color: colors.gray[400] } : { color: colors.gray[900] },
    outline: disabled ? { color: colors.gray[400] } : { color: colors.primary },
    ghost: disabled ? { color: colors.gray[400] } : { color: colors.gray[900] },
    destructive: disabled ? { color: colors.gray[500] } : { color: colors.white },
  };

  return {
    ...baseStyle,
    ...sizeTextStyles[size],
    ...variantTextStyles[variant],
  };
};

/**
 * Button atom component
 * 
 * A reusable button component following atomic design principles.
 * Supports multiple variants, sizes, loading states, and accessibility features.
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   size="md" 
 *   onPress={handlePress}
 *   loading={isLoading}
 * >
 *   Convert Video
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  testID,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const handlePress = useCallback((event: any) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  }, [isDisabled, onPress]);

  const buttonStyles = getButtonStyles(variant, size, isDisabled, fullWidth);
  const textStyles = getTextStyles(variant, size, isDisabled);

  // Get loading indicator color
  const getLoadingColor = () => {
    if (variant === 'primary' || variant === 'destructive') {
      return colors.white;
    }
    return colors.gray[600];
  };

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles,
        {
          opacity: pressed && !isDisabled ? 0.8 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <>
          {leftIcon}
          <View style={{ width: 8 }} />
        </>
      )}

      {/* Loading Indicator */}
      {loading && (
        <>
          <ActivityIndicator size="small" color={getLoadingColor()} />
          <View style={{ width: 8 }} />
        </>
      )}

      {/* Button Text */}
      <Text style={textStyles}>
        {children}
      </Text>

      {/* Right Icon */}
      {rightIcon && !loading && (
        <>
          <View style={{ width: 8 }} />
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};