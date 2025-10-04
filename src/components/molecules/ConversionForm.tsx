import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
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
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>Conversion Settings</Text>

      <ScrollView style={styles.scrollView}>
        {/* Quality Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Quality</Text>
          <View style={styles.buttonRow}>
            {([OutputQuality.LOW, OutputQuality.MEDIUM, OutputQuality.HIGH, OutputQuality.ULTRA] as const).map((quality) => (
              <Pressable
                key={quality}
                onPress={() => updateSetting('quality', quality)}
                style={
                  settings.quality === quality
                    ? [styles.optionButton, styles.optionButtonActive]
                    : styles.optionButton
                }
              >
                <Text
                  style={
                    settings.quality === quality
                      ? {...styles.optionButtonText, ...styles.optionButtonTextActive}
                      : styles.optionButtonText
                  }
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Format Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Format</Text>
          <View style={styles.buttonRow}>
            {([VideoFormat.MP4, VideoFormat.MOV, VideoFormat.AVI, VideoFormat.MKV] as const).map((format) => (
              <Pressable
                key={format}
                onPress={() => updateSetting('outputFormat', format)}
                style={
                  settings.outputFormat === format
                    ? [styles.optionButton, styles.optionButtonActive]
                    : styles.optionButton
                }
              >
                <Text
                  style={
                    settings.outputFormat === format
                      ? {...styles.optionButtonText, ...styles.optionButtonTextActive}
                      : styles.optionButtonText
                  }
                >
                  {format.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Compression Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Compression</Text>
          <View style={styles.buttonRow}>
            {([CompressionLevel.LOW, CompressionLevel.MEDIUM, CompressionLevel.HIGH] as const).map((compression) => (
              <Pressable
                key={compression}
                onPress={() => updateSetting('compression', compression)}
                style={
                  settings.compression === compression
                    ? [styles.optionButton, styles.optionButtonActive]
                    : styles.optionButton
                }
              >
                <Text
                  style={
                    settings.compression === compression
                      ? {...styles.optionButtonText, ...styles.optionButtonTextActive}
                      : styles.optionButtonText
                  }
                >
                  {compression.charAt(0).toUpperCase() + compression.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 400,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#2f6690',
    borderColor: '#2f6690',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 24,
  },
});