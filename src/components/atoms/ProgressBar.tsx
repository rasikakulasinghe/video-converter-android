import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Text } from './Text';

/**
 * ProgressBar variant types for different use cases
 */
export type ProgressBarVariant = 'default' | 'success' | 'error' | 'warning';

/**
 * ProgressBar size types
 */
export type ProgressBarSize = 'sm' | 'md' | 'lg';

/**
 * ProgressBar component props interface
 */
export interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Visual variant of the progress bar */
  variant?: ProgressBarVariant;
  /** Size of the progress bar */
  size?: ProgressBarSize;
  /** Whether to show progress text */
  showText?: boolean;
  /** Custom progress text (overrides default percentage) */
  text?: string;
  /** Whether the progress bar is indeterminate (loading) */
  indeterminate?: boolean;
  /** Whether to animate progress changes */
  animated?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom progress bar style */
  progressBarStyle?: ViewStyle;
  /** Custom fill style */
  fillStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

// Design system colors
const colors = {
  background: '#e5e7eb',      // Gray 200 - Background track
  primary: '#2f6690',         // Primary blue - Default progress
  success: '#059669',         // Emerald 600 - Success state
  error: '#dc2626',           // Red 600 - Error state
  warning: '#d97706',         // Amber 600 - Warning state
  text: '#111827',            // Gray 900 - Text color
  textSecondary: '#6b7280',   // Gray 500 - Secondary text
};

/**
 * Get progress bar styles based on variant and size
 */
const getProgressBarStyles = (
  variant: ProgressBarVariant,
  size: ProgressBarSize
): { container: ViewStyle; track: ViewStyle; fill: ViewStyle } => {
  // Size styles
  const sizeStyles = {
    sm: { height: 4, borderRadius: 2 },
    md: { height: 8, borderRadius: 4 },
    lg: { height: 12, borderRadius: 6 },
  };

  // Variant colors
  const variantColors = {
    default: colors.primary,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
  };

  const { height, borderRadius } = sizeStyles[size];
  const fillColor = variantColors[variant];

  return {
    container: {
      width: '100%',
    },
    track: {
      width: '100%',
      height,
      backgroundColor: colors.background,
      borderRadius,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: fillColor,
      borderRadius,
    },
  };
};

/**
 * Get text variant based on progress bar size
 */
const getTextVariant = (size: ProgressBarSize) => {
  switch (size) {
    case 'sm':
      return 'caption' as const;
    case 'md':
      return 'body-small' as const;
    case 'lg':
      return 'body' as const;
    default:
      return 'body-small' as const;
  }
};

/**
 * ProgressBar atom component
 * 
 * A flexible progress bar component with support for different variants,
 * sizes, animations, and accessibility features.
 * 
 * @example
 * ```tsx
 * <ProgressBar 
 *   value={75} 
 *   variant="success" 
 *   size="md" 
 *   showText 
 *   animated 
 * />
 * 
 * <ProgressBar 
 *   value={0} 
 *   indeterminate 
 *   variant="default" 
 *   size="sm" 
 *   text="Converting..."
 * />
 * 
 * <ProgressBar 
 *   value={25} 
 *   variant="error" 
 *   size="lg" 
 *   text="Error occurred"
 *   showText
 * />
 * ```
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showText = false,
  text,
  indeterminate = false,
  animated = true,
  animationDuration = 300,
  containerStyle,
  progressBarStyle,
  fillStyle,
  testID,
  accessibilityLabel,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const indeterminateAnim = useRef(new Animated.Value(0)).current;

  // Clamp value between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;

  // Calculate progress percentage for width
  const progressWidth = indeterminate ? 30 : percentage;

  const styles = getProgressBarStyles(variant, size);
  const textVariant = getTextVariant(size);

  // Animate progress changes
  useEffect(() => {
    if (!indeterminate && animated) {
      Animated.timing(animatedValue, {
        toValue: progressWidth,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else if (!animated) {
      animatedValue.setValue(progressWidth);
    }
  }, [progressWidth, animated, animationDuration, indeterminate, animatedValue]);

  // Indeterminate animation
  useEffect(() => {
    if (indeterminate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(indeterminateAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
    return undefined;
  }, [indeterminate, indeterminateAnim]);

  // Get the display text
  const displayText = text || `${Math.round(percentage)}%`;

  // Calculate animated width
  const animatedWidth = animated
    ? animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
      }) as any
    : `${progressWidth}%`;

  // Calculate indeterminate position
  const indeterminateLeft = indeterminate
    ? indeterminateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-30%', '100%'],
        extrapolate: 'clamp',
      }) as any
    : 0;

  return (
    <View 
      style={[styles.container, containerStyle]} 
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || `Progress: ${displayText}`}
      accessibilityValue={{
        min: 0,
        max,
        now: clampedValue,
      }}
    >
      {/* Progress Text */}
      {showText && (
        <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant={textVariant} color="primary">
            {displayText}
          </Text>
          {!indeterminate && (
            <Text variant={textVariant} color="secondary">
              {`${Math.round(clampedValue)} / ${Math.round(max)}`}
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar Track */}
      <View style={[styles.track, progressBarStyle]}>
        {/* Progress Bar Fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth,
              left: indeterminateLeft,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
};