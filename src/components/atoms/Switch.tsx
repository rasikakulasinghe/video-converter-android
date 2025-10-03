import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Custom Switch component for React Native 0.76+ compatibility
 * Provides a toggle switch using Pressable and animated views
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        value ? styles.containerActive : styles.containerInactive,
        disabled && styles.containerDisabled,
      ]}
    >
      <View
        style={[
          styles.thumb,
          value && styles.thumbActive,
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  containerActive: {
    backgroundColor: '#2563eb', // blue-600
  },
  containerInactive: {
    backgroundColor: '#d1d5db', // gray-300
  },
  containerDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  },
  thumbActive: {
    transform: [{ translateX: 24 }],
  },
});