import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { ConversionSettings, VideoFormat, OutputQuality, CompressionLevel } from '../../types/models';

/**
 * Props for the ConversionForm component
 */
export interface ConversionFormProps {
  /** Whether the form is visible */
  visible: boolean;
  /** Initial form values */
  initialValues?: Partial<ConversionSettings>;
  /** Whether the form is in loading state */
  loading?: boolean;
  /** Callback when form is submitted */
  onSubmit: (params: ConversionSettings) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom styles */
  style?: any;
  /** Test ID for testing */
  testID?: string;
}

/**
 * ConversionForm component for setting video conversion parameters
 */
export const ConversionForm: React.FC<ConversionFormProps> = ({
  visible,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
  style,
  testID = 'conversion-form',
}) => {
  const [settings, setSettings] = useState<ConversionSettings>({
    outputFormat: VideoFormat.MP4,
    quality: OutputQuality.MEDIUM,
    compression: CompressionLevel.MEDIUM,
    targetBitrate: 2000000,
    maxWidth: 1920,
    maxHeight: 1080,
    maintainAspectRatio: true,
    audioCodec: 'aac',
    ...initialValues,
  });

  const handleSubmit = useCallback(() => {
    onSubmit(settings);
  }, [settings, onSubmit]);

  const updateSetting = useCallback(<K extends keyof ConversionSettings>(
    key: K,
    value: ConversionSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <View className="bg-white p-4 rounded-lg" style={style} testID={testID}>
      <Text className="text-lg font-semibold mb-4">Conversion Settings</Text>
      
      <ScrollView className="space-y-4">
        {/* Quality Selection */}
        <View>
          <Text className="text-sm font-medium mb-2">Quality</Text>
          <View className="flex-row space-x-2">
            {([OutputQuality.LOW, OutputQuality.MEDIUM, OutputQuality.HIGH, OutputQuality.ULTRA] as const).map((quality) => (
              <Button
                key={quality}
                variant={settings.quality === quality ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateSetting('quality', quality)}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Button>
            ))}
          </View>
        </View>

        {/* Format Selection */}
        <View>
          <Text className="text-sm font-medium mb-2">Format</Text>
          <View className="flex-row space-x-2">
            {([VideoFormat.MP4, VideoFormat.MOV, VideoFormat.AVI, VideoFormat.MKV] as const).map((format) => (
              <Button
                key={format}
                variant={settings.outputFormat === format ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateSetting('outputFormat', format)}
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </View>
        </View>

        {/* Compression Selection */}
        <View>
          <Text className="text-sm font-medium mb-2">Compression</Text>
          <View className="flex-row space-x-2">
            {([CompressionLevel.LOW, CompressionLevel.MEDIUM, CompressionLevel.HIGH] as const).map((compression) => (
              <Button
                key={compression}
                variant={settings.compression === compression ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateSetting('compression', compression)}
              >
                {compression.charAt(0).toUpperCase() + compression.slice(1)}
              </Button>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={loading}
          >
            Start Conversion
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};