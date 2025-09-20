import React, { useCallback, useState } from 'react';
import { ScrollView, View, Alert, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Switch } from '../components/atoms/Switch';

import type { RootStackParamList } from '../types/navigation';
import type { ConversionSettings } from '../types/models';

interface SettingsScreenProps {}

/**
 * Settings screen component for the video converter app.
 * Provides configuration options for conversion settings, device monitoring,
 * and app preferences.
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Local state for settings (simplified for now)
  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    quality: 'medium',
    format: 'mp4',
    audioCodec: 'aac',
    preserveMetadata: true,
  });
  
  const [deviceSettings, setDeviceSettings] = useState({
    pauseOnLowBattery: true,
    pauseOnOverheat: true,
    minBatteryLevel: 0.2,
  });
  
  const [storageSettings, setStorageSettings] = useState({
    autoDeleteOriginals: false,
    autoCleanCache: true,
    maxCacheAge: 7,
  });
  
  // Mock device state with more realistic types
  const deviceState = {
    thermalState: 'normal' as 'normal' | 'fair' | 'serious' | 'critical',
    batteryLevel: 0.85,
    isLowPowerMode: false,
    availableStorage: 5000000000, // 5GB
    totalStorage: 64000000000, // 64GB
  };
  
  // Local state
  const [cacheSize, setCacheSize] = useState<number>(1024 * 1024 * 150); // 150MB
  const [isClearing, setIsClearing] = useState(false);
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Handle setting updates
  const handleUpdateConversionSettings = useCallback((updates: Partial<ConversionSettings>) => {
    setConversionSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  const handleUpdateDeviceSettings = useCallback((updates: Partial<typeof deviceSettings>) => {
    setDeviceSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  const handleUpdateStorageSettings = useCallback((updates: Partial<typeof storageSettings>) => {
    setStorageSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Handle cache clearing
  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Clear Cache',
      'This will delete all temporary files and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            // Simulate cache clearing
            setTimeout(() => {
              setCacheSize(0);
              setIsClearing(false);
              Alert.alert('Success', 'Cache cleared successfully.');
            }, 1000);
          },
        },
      ]
    );
  }, []);
  
  // Handle settings reset
  const handleResetSettings = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to their default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setConversionSettings({
              quality: 'medium',
              format: 'mp4',
              audioCodec: 'aac',
              preserveMetadata: true,
            });
            setDeviceSettings({
              pauseOnLowBattery: true,
              pauseOnOverheat: true,
              minBatteryLevel: 0.2,
            });
            setStorageSettings({
              autoDeleteOriginals: false,
              autoCleanCache: true,
              maxCacheAge: 7,
            });
            Alert.alert('Success', 'Settings have been reset to defaults.');
          },
        },
      ]
    );
  }, []);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Get thermal state style
  const getThermalStateStyle = (state: typeof deviceState.thermalState) => {
    switch (state) {
      case 'critical':
        return {...styles.statusValue, ...styles.statusCritical};
      case 'serious':
        return {...styles.statusValue, ...styles.statusWarning};
      case 'fair':
        return {...styles.statusValue, ...styles.statusCaution};
      default:
        return {...styles.statusValue, ...styles.statusNormal};
    }
  };
  
  // Get power mode style
  const getPowerModeStyle = (isLowPower: boolean) => {
    return isLowPower 
      ? {...styles.statusValue, ...styles.statusWarning}
      : {...styles.statusValue, ...styles.statusNormal};
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            Settings
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Configure app behavior and preferences
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Video Conversion Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Video Conversion
          </Text>
          
          <View style={styles.sectionContent}>
            {/* Quality Setting */}
            <View>
              <Text style={styles.fieldLabel}>
                Output Quality
              </Text>
              <View style={styles.buttonRow}>
                {(['low', 'medium', 'high'] as const).map((quality) => (
                  <Pressable
                    key={quality}
                    onPress={() => handleUpdateConversionSettings({ quality })}
                    style={[
                      styles.optionButton,
                      conversionSettings.quality === quality && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={
                        conversionSettings.quality === quality 
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
            
            {/* Format Setting */}
            <View>
              <Text style={styles.fieldLabel}>
                Output Format
              </Text>
              <View style={styles.buttonRow}>
                {(['mp4', 'webm'] as const).map((format) => (
                  <Pressable
                    key={format}
                    onPress={() => handleUpdateConversionSettings({ format })}
                    style={[
                      styles.optionButton,
                      conversionSettings.format === format && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={
                        conversionSettings.format === format 
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
            
            {/* Audio Codec */}
            <View>
              <Text style={styles.fieldLabel}>
                Audio Codec
              </Text>
              <View style={styles.buttonRow}>
                {(['aac', 'mp3'] as const).map((codec) => (
                  <Pressable
                    key={codec}
                    onPress={() => handleUpdateConversionSettings({ audioCodec: codec })}
                    style={[
                      styles.optionButton,
                      conversionSettings.audioCodec === codec && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={
                        conversionSettings.audioCodec === codec 
                          ? {...styles.optionButtonText, ...styles.optionButtonTextActive}
                          : styles.optionButtonText
                      }
                    >
                      {codec.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Preserve Metadata */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>
                  Preserve Metadata
                </Text>
                <Text style={styles.fieldDescription}>
                  Keep original file information like creation date and location
                </Text>
              </View>
              <Switch
                value={conversionSettings.preserveMetadata}
                onValueChange={(value) => 
                  handleUpdateConversionSettings({ preserveMetadata: value })
                }
              />
            </View>
          </View>
        </View>
        
        {/* Device Monitoring Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Device Monitoring
          </Text>
          
          <View style={styles.sectionContent}>
            {/* Current Device Status */}
            <View style={styles.statusCard}>
              <Text style={styles.fieldLabel}>
                Current Status
              </Text>
              <View style={styles.statusList}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Battery Level</Text>
                  <Text style={styles.statusValue}>
                    {formatPercentage(deviceState.batteryLevel)}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Thermal State</Text>
                  <Text style={getThermalStateStyle(deviceState.thermalState)}>
                    {deviceState.thermalState.charAt(0).toUpperCase() + deviceState.thermalState.slice(1)}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Low Power Mode</Text>
                  <Text style={getPowerModeStyle(deviceState.isLowPowerMode)}>
                    {deviceState.isLowPowerMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Available Storage</Text>
                  <Text style={styles.statusValue}>
                    {formatFileSize(deviceState.availableStorage)} / {formatFileSize(deviceState.totalStorage)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Device Settings */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>
                  Pause on Low Battery
                </Text>
                <Text style={styles.fieldDescription}>
                  Automatically pause conversion when battery is below {formatPercentage(deviceSettings.minBatteryLevel)}
                </Text>
              </View>
              <Switch
                value={deviceSettings.pauseOnLowBattery}
                onValueChange={(value) => 
                  handleUpdateDeviceSettings({ pauseOnLowBattery: value })
                }
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>
                  Pause on Overheating
                </Text>
                <Text style={styles.fieldDescription}>
                  Automatically pause conversion when device overheats
                </Text>
              </View>
              <Switch
                value={deviceSettings.pauseOnOverheat}
                onValueChange={(value) => 
                  handleUpdateDeviceSettings({ pauseOnOverheat: value })
                }
              />
            </View>
          </View>
        </View>
        
        {/* Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Storage Management
          </Text>
          
          <View style={styles.sectionContent}>
            {/* Auto-delete Settings */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>
                  Auto-delete Originals
                </Text>
                <Text style={styles.fieldDescription}>
                  Delete original files after successful conversion
                </Text>
              </View>
              <Switch
                value={storageSettings.autoDeleteOriginals}
                onValueChange={(value) => 
                  handleUpdateStorageSettings({ autoDeleteOriginals: value })
                }
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.fieldLabel}>
                  Auto-clean Cache
                </Text>
                <Text style={styles.fieldDescription}>
                  Automatically clean temporary files after {storageSettings.maxCacheAge} days
                </Text>
              </View>
              <Switch
                value={storageSettings.autoCleanCache}
                onValueChange={(value) => 
                  handleUpdateStorageSettings({ autoCleanCache: value })
                }
              />
            </View>
            
            {/* Cache Management */}
            <View style={styles.statusCard}>
              <View style={styles.cacheHeader}>
                <Text style={styles.fieldLabel}>
                  Cache Storage
                </Text>
                <Text style={styles.statusValue}>
                  {formatFileSize(cacheSize)}
                </Text>
              </View>
              <Button
                variant="secondary"
                onPress={handleClearCache}
                disabled={isClearing || cacheSize === 0}
              >
                {isClearing ? "Clearing..." : "Clear Cache"}
              </Button>
            </View>
          </View>
        </View>
        
        {/* App Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            App Actions
          </Text>
          
          <View style={styles.sectionContent}>
            <Button
              variant="destructive"
              onPress={handleResetSettings}
            >
              Reset All Settings
            </Button>
          </View>
        </View>
        
        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About
          </Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Version</Text>
              <Text style={styles.statusValue}>1.0.0</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Build</Text>
              <Text style={styles.statusValue}>2025.09.18</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Platform</Text>
              <Text style={styles.statusValue}>Android</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  backIcon: {
    color: '#6b7280',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 44,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionContent: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  },
  optionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionButtonText: {
    textAlign: 'center',
    color: '#374151',
  },
  optionButtonTextActive: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  statusCard: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statusList: {
    gap: 8,
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: '#6b7280',
  },
  statusValue: {
    color: '#111827',
    fontWeight: '500',
  },
  statusCritical: {
    color: '#dc2626',
  },
  statusWarning: {
    color: '#ea580c',
  },
  statusCaution: {
    color: '#ca8a04',
  },
  statusNormal: {
    color: '#059669',
  },
  cacheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});