import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

/**
 * Text variant types for typography hierarchy
 */
export type TextVariant = 
  | 'caption'      // 12px - Small captions, metadata
  | 'body-small'   // 14px - Small body text
  | 'body'         // 16px - Default body text
  | 'subheading'   // 18px - Section subheadings
  | 'heading'      // 20px - Card/section headings
  | 'title'        // 24px - Screen titles
  | 'display';     // 32px - Large display text

/**
 * Text weight types
 */
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/**
 * Text color types based on design system
 */
export type TextColor = 
  | 'primary'      // Primary text color
  | 'secondary'    // Secondary text color
  | 'muted'        // Muted/disabled text
  | 'inverse'      // White text for dark backgrounds
  | 'error'        // Error state text
  | 'warning'      // Warning state text
  | 'success';     // Success state text

/**
 * Text component props interface
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text content to display */
  children: React.ReactNode;
  /** Typography variant controlling size and line height */
  variant?: TextVariant;
  /** Font weight */
  weight?: TextWeight;
  /** Text color from design system */
  color?: TextColor;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether text should be italic */
  italic?: boolean;
  /** Whether text should be underlined */
  underline?: boolean;
  /** Whether text should be struck through */
  strikethrough?: boolean;
  /** Number of lines to display (for truncation) */
  numberOfLines?: number;
  /** Custom style overrides (use sparingly) */
  style?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// Design system colors
const colors = {
  primary: '#111827',      // Gray 900 - Primary text
  secondary: '#6b7280',    // Gray 500 - Secondary text
  muted: '#9ca3af',        // Gray 400 - Muted text
  inverse: '#ffffff',      // White - For dark backgrounds
  error: '#dc2626',        // Red 600 - Error states
  warning: '#d97706',      // Amber 600 - Warning states
  success: '#059669',      // Emerald 600 - Success states
};

/**
 * Get text styles based on variant, weight, color, and other props
 */
const getTextStyles = (
  variant: TextVariant,
  weight: TextWeight,
  color: TextColor,
  align: TextProps['align'],
  italic: boolean,
  underline: boolean,
  strikethrough: boolean
): TextStyle => {
  // Base typography styles for each variant
  const variantStyles: Record<TextVariant, TextStyle> = {
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
    'body-small': {
      fontSize: 14,
      lineHeight: 20,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    subheading: {
      fontSize: 18,
      lineHeight: 28,
    },
    heading: {
      fontSize: 20,
      lineHeight: 28,
    },
    title: {
      fontSize: 24,
      lineHeight: 32,
    },
    display: {
      fontSize: 32,
      lineHeight: 40,
    },
  };

  // Font weight styles
  const weightStyles: Record<TextWeight, TextStyle> = {
    normal: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
  };

  // Color styles
  const colorStyles: Record<TextColor, TextStyle> = {
    primary: { color: colors.primary },
    secondary: { color: colors.secondary },
    muted: { color: colors.muted },
    inverse: { color: colors.inverse },
    error: { color: colors.error },
    warning: { color: colors.warning },
    success: { color: colors.success },
  };

  // Additional styles
  const additionalStyles: TextStyle = {};

  if (align) {
    additionalStyles.textAlign = align;
  }

  if (italic) {
    additionalStyles.fontStyle = 'italic';
  }

  if (underline && strikethrough) {
    additionalStyles.textDecorationLine = 'underline line-through';
  } else if (underline) {
    additionalStyles.textDecorationLine = 'underline';
  } else if (strikethrough) {
    additionalStyles.textDecorationLine = 'line-through';
  }

  return {
    ...variantStyles[variant],
    ...weightStyles[weight],
    ...colorStyles[color],
    ...additionalStyles,
  };
};

/**
 * Text atom component
 * 
 * A typography component following Material Design principles and atomic design.
 * Provides consistent text styling throughout the application with semantic variants.
 * 
 * @example
 * ```tsx
 * <Text variant="title" weight="bold" color="primary">
 *   Main Screen Title
 * </Text>
 * 
 * <Text variant="body" color="secondary">
 *   This is secondary body text with proper line height and spacing.
 * </Text>
 * 
 * <Text variant="caption" color="muted" numberOfLines={1}>
 *   This caption will truncate if too long
 * </Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  align,
  italic = false,
  underline = false,
  strikethrough = false,
  numberOfLines,
  style,
  testID,
  ...props
}) => {
  const textStyles = getTextStyles(
    variant,
    weight,
    color,
    align,
    italic,
    underline,
    strikethrough
  );

  return (
    <RNText
      style={[textStyles, style]}
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </RNText>
  );
};