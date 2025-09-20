import React from 'react';
import { Pressable, View } from 'react-native';

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
      className={`w-12 h-6 rounded-full p-1 ${
        value ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <View
        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </Pressable>
  );
};