import React from 'react';
import { View, ViewStyle } from 'react-native';

/**
 * Icon name types - common icons used in video converter app
 */
export type IconName =
  | 'play'
  | 'pause'
  | 'stop'
  | 'folder'
  | 'file'
  | 'video'
  | 'settings'
  | 'check'
  | 'close'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'plus'
  | 'minus'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'warning'
  | 'error'
  | 'info'
  | 'more-horizontal'
  | 'more-vertical';

/**
 * Icon size types
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Icon color types based on design system
 */
export type IconColor = 
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'error'
  | 'warning'
  | 'success';

/**
 * Icon component props interface
 */
export interface IconProps {
  /** Icon name from the available icon set */
  name: IconName;
  /** Size of the icon */
  size?: IconSize;
  /** Color of the icon from design system */
  color?: IconColor;
  /** Custom style overrides */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

// Design system colors
const colors = {
  primary: '#2f6690',      // Primary blue
  secondary: '#6b7280',    // Gray 500
  muted: '#9ca3af',        // Gray 400
  inverse: '#ffffff',      // White
  error: '#dc2626',        // Red 600
  warning: '#d97706',      // Amber 600
  success: '#059669',      // Emerald 600
};

// Icon size mapping
const sizes: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Simple SVG path components for icons
 * In a real app, you might use react-native-svg or vector-icons
 * For now, we'll create simple geometric shapes to represent icons
 */
const IconPaths: Record<IconName, React.FC<{ size: number; color: string }>> = {
  play: ({ size, color }) => (
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: size * 0.6,
      borderLeftColor: color,
      borderTopWidth: size * 0.4,
      borderTopColor: 'transparent',
      borderBottomWidth: size * 0.4,
      borderBottomColor: 'transparent',
      marginLeft: size * 0.2,
    }} />
  ),
  
  pause: ({ size, color }) => (
    <View style={{ flexDirection: 'row', gap: size * 0.2 }}>
      <View style={{
        width: size * 0.3,
        height: size * 0.8,
        backgroundColor: color,
      }} />
      <View style={{
        width: size * 0.3,
        height: size * 0.8,
        backgroundColor: color,
      }} />
    </View>
  ),
  
  stop: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      backgroundColor: color,
    }} />
  ),
  
  folder: ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.9,
        height: size * 0.7,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: 'transparent',
      }} />
      <View style={{
        position: 'absolute',
        top: -size * 0.1,
        width: size * 0.4,
        height: size * 0.2,
        backgroundColor: color,
      }} />
    </View>
  ),
  
  file: ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.7,
        height: size * 0.9,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: 'transparent',
      }} />
      <View style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.15,
        borderLeftColor: 'transparent',
        borderBottomWidth: size * 0.15,
        borderBottomColor: color,
      }} />
    </View>
  ),
  
  video: ({ size, color }) => (
    <View style={{
      width: size * 0.9,
      height: size * 0.7,
      borderWidth: 1,
      borderColor: color,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.3,
        borderLeftColor: color,
        borderTopWidth: size * 0.2,
        borderTopColor: 'transparent',
        borderBottomWidth: size * 0.2,
        borderBottomColor: 'transparent',
      }} />
    </View>
  ),
  
  settings: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      borderRadius: size * 0.4,
      borderWidth: 1,
      borderColor: color,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: size * 0.15,
        backgroundColor: color,
      }} />
    </View>
  ),
  
  check: ({ size, color }) => (
    <View style={{ transform: [{ rotate: '45deg' }] }}>
      <View style={{
        width: size * 0.6,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.1,
      }} />
      <View style={{
        width: size * 0.3,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        right: 0,
        bottom: size * 0.1,
        transform: [{ rotate: '90deg' }],
        transformOrigin: 'right bottom',
      }} />
    </View>
  ),
  
  close: ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.8,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.4,
        transform: [{ rotate: '45deg' }],
        transformOrigin: 'center',
      }} />
      <View style={{
        width: size * 0.8,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.4,
        transform: [{ rotate: '-45deg' }],
        transformOrigin: 'center',
      }} />
    </View>
  ),
  
  'arrow-left': ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.6,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.4,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderRightWidth: size * 0.3,
        borderRightColor: color,
        borderTopWidth: size * 0.2,
        borderTopColor: 'transparent',
        borderBottomWidth: size * 0.2,
        borderBottomColor: 'transparent',
        position: 'absolute',
        top: size * 0.2,
      }} />
    </View>
  ),
  
  'arrow-right': ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.6,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.4,
        left: size * 0.2,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.3,
        borderLeftColor: color,
        borderTopWidth: size * 0.2,
        borderTopColor: 'transparent',
        borderBottomWidth: size * 0.2,
        borderBottomColor: 'transparent',
        position: 'absolute',
        top: size * 0.2,
        right: 0,
      }} />
    </View>
  ),
  
  'arrow-up': ({ size, color }) => (
    <View>
      <View style={{
        width: 2,
        height: size * 0.6,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.4,
        top: size * 0.2,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderBottomWidth: size * 0.3,
        borderBottomColor: color,
        borderLeftWidth: size * 0.2,
        borderLeftColor: 'transparent',
        borderRightWidth: size * 0.2,
        borderRightColor: 'transparent',
        position: 'absolute',
        left: size * 0.2,
      }} />
    </View>
  ),
  
  'arrow-down': ({ size, color }) => (
    <View>
      <View style={{
        width: 2,
        height: size * 0.6,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.4,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderTopWidth: size * 0.3,
        borderTopColor: color,
        borderLeftWidth: size * 0.2,
        borderLeftColor: 'transparent',
        borderRightWidth: size * 0.2,
        borderRightColor: 'transparent',
        position: 'absolute',
        left: size * 0.2,
        bottom: 0,
      }} />
    </View>
  ),
  
  plus: ({ size, color }) => (
    <View>
      <View style={{
        width: size * 0.8,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.4,
      }} />
      <View style={{
        width: 2,
        height: size * 0.8,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.4,
      }} />
    </View>
  ),
  
  minus: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: 2,
      backgroundColor: color,
    }} />
  ),
  
  download: ({ size, color }) => (
    <View>
      <View style={{
        width: 2,
        height: size * 0.5,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.4,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderTopWidth: size * 0.3,
        borderTopColor: color,
        borderLeftWidth: size * 0.2,
        borderLeftColor: 'transparent',
        borderRightWidth: size * 0.2,
        borderRightColor: 'transparent',
        position: 'absolute',
        left: size * 0.2,
        top: size * 0.3,
      }} />
      <View style={{
        width: size * 0.8,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: 0,
      }} />
    </View>
  ),
  
  upload: ({ size, color }) => (
    <View>
      <View style={{
        width: 2,
        height: size * 0.5,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.4,
        top: size * 0.3,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderBottomWidth: size * 0.3,
        borderBottomColor: color,
        borderLeftWidth: size * 0.2,
        borderLeftColor: 'transparent',
        borderRightWidth: size * 0.2,
        borderRightColor: 'transparent',
        position: 'absolute',
        left: size * 0.2,
      }} />
      <View style={{
        width: size * 0.8,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: 0,
      }} />
    </View>
  ),
  
  refresh: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      borderRadius: size * 0.4,
      borderWidth: 2,
      borderColor: color,
      borderTopColor: 'transparent',
    }} />
  ),
  
  warning: ({ size, color }) => (
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: size * 0.4,
      borderLeftColor: 'transparent',
      borderRightWidth: size * 0.4,
      borderRightColor: 'transparent',
      borderBottomWidth: size * 0.7,
      borderBottomColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: 2,
        height: size * 0.3,
        backgroundColor: 'white',
        position: 'absolute',
        top: size * 0.2,
      }} />
      <View style={{
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: size * 0.1,
      }} />
    </View>
  ),
  
  error: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      borderRadius: size * 0.4,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: size * 0.5,
        height: 2,
        backgroundColor: 'white',
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
      }} />
      <View style={{
        width: size * 0.5,
        height: 2,
        backgroundColor: 'white',
        transform: [{ rotate: '-45deg' }],
        position: 'absolute',
      }} />
    </View>
  ),
  
  info: ({ size, color }) => (
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      borderRadius: size * 0.4,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{
        width: 2,
        height: size * 0.4,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: size * 0.1,
      }} />
      <View style={{
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'white',
        position: 'absolute',
        top: size * 0.1,
      }} />
    </View>
  ),
  
  'more-horizontal': ({ size, color }) => (
    <View style={{ flexDirection: 'row', gap: size * 0.15 }}>
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
    </View>
  ),
  
  'more-vertical': ({ size, color }) => (
    <View style={{ gap: size * 0.15 }}>
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
      <View style={{
        width: size * 0.15,
        height: size * 0.15,
        borderRadius: size * 0.075,
        backgroundColor: color,
      }} />
    </View>
  ),
};

/**
 * Icon atom component
 * 
 * A flexible icon component that renders simple geometric shapes to represent icons.
 * In a production app, you would typically use react-native-vector-icons or react-native-svg.
 * 
 * @example
 * ```tsx
 * <Icon name="play" size="md" color="primary" />
 * <Icon name="video" size="lg" color="secondary" />
 * <Icon name="warning" size="sm" color="warning" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'primary',
  style,
  testID,
  accessibilityLabel,
}) => {
  const iconSize = sizes[size];
  const iconColor = colors[color];
  const IconComponent = IconPaths[name];

  return (
    <View
      style={[
        {
          width: iconSize,
          height: iconSize,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `${name} icon`}
    >
      <IconComponent size={iconSize} color={iconColor} />
    </View>
  );
};