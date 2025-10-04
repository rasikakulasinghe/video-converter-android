import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, Alert, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { FileCard } from '../components/molecules/FileCard';
import { ProgressCard, ConversionProgress as ProgressCardProgress } from '../components/molecules/ProgressCard';
import { ConversionForm } from '../components/molecules/ConversionForm';
import { ActionSheet } from '../components/molecules/ActionSheet';

import { useConversionStore } from '../stores/conversionStore';
import { useFileStore } from '../stores/fileStore';
import { useDeviceStore } from '../stores/deviceStore';
import { useFileManager } from '../hooks/useFileManager';
import { useVideoProcessor } from '../hooks/useVideoProcessor';

import type { VideoFile, ConversionRequest, ConversionSettings } from '../types/models';
import { VideoQuality, OutputFormat } from '../types/models';
import type { RootStackParamList } from '../types/navigation';

interface MainScreenProps {}

/**
 * Main screen component for the video converter app.
 * Provides the primary interface for file selection, conversion settings,
 * and processing management.
 */
export const MainScreen: React.FC<MainScreenProps> = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Store hooks
  const {
    currentJob,
    progress,
    isProcessing,
    startConversion,
    cancelConversion,
    clearJob,
  } = useConversionStore();
  
  const {
    selectedFiles,
    videoFiles,
    processedFiles,
    addFile,
    removeFile,
    clearFiles,
  } = useFileStore();
  
  // Computed: get actual VideoFile objects for selected files
  const selectedVideoFiles = useMemo(() => {
    return videoFiles.filter(file => selectedFiles.includes(file.path));
  }, [videoFiles, selectedFiles]);
  
  const {
    thermalState,
    batteryLevel,
    storageAvailable: availableStorage,
  } = useDeviceStore();
  
  // Service hooks
  const { selectFiles, deleteFile } = useFileManager();
  const { convertVideo } = useVideoProcessor();
  
  // Local state
  const [showConversionForm, setShowConversionForm] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState<VideoFile | null>(null);
  
  // Handle file selection
  const handleSelectFiles = useCallback(async () => {
    try {
      const files = await selectFiles();
      files.forEach(file => addFile(file));
    } catch (error) {
      Alert.alert(
        'File Selection Error',
        'Unable to select files. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [selectFiles, addFile]);
  
  // Handle file action menu
  const handleFilePress = useCallback((file: VideoFile) => {
    setSelectedFileForAction(file);
    setShowActionSheet(true);
  }, []);
  
  // Handle conversion start
  const handleStartConversion = useCallback(async (settings: ConversionSettings) => {
    if (selectedFiles.length === 0) {
      Alert.alert(
        'No Files Selected',
        'Please select video files to convert.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check device state
    if (batteryLevel !== null && batteryLevel < 0.2) {
      Alert.alert(
        'Low Battery',
        'Battery level is low. Consider charging before conversion.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => proceedWithConversion(settings) },
        ]
      );
      return;
    }

    proceedWithConversion(settings);
  }, [selectedFiles, batteryLevel]);

  const proceedWithConversion = useCallback(async (settings: ConversionSettings) => {
    try {
      // Process the first file for now (single file conversion)
      if (selectedVideoFiles.length === 0) return;

      const firstFile = selectedVideoFiles[0];
      if (!firstFile) return; // Type guard

      const request: ConversionRequest = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inputFile: firstFile,
        outputPath: `${firstFile.path.replace(/\.[^/.]+$/, "")}_converted.mp4`,
        settings: settings,
        createdAt: new Date(),
      };

      await startConversion(request);
      setShowConversionForm(false);
    } catch (error) {
      Alert.alert(
        'Conversion Error',
        'Unable to start conversion. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [selectedVideoFiles, startConversion]);
  
  // Handle conversion cancellation
  const handleCancelConversion = useCallback(async () => {
    Alert.alert(
      'Cancel Conversion',
      'Are you sure you want to cancel the current conversion?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: cancelConversion },
      ]
    );
  }, [cancelConversion]);
  
  // Handle file removal
  const handleRemoveFile = useCallback(async (file: VideoFile) => {
    removeFile(file.id);
    setShowActionSheet(false);
    setSelectedFileForAction(null);
  }, [removeFile]);
  
  // Handle file deletion
  const handleDeleteFile = useCallback(async (file: VideoFile) => {
    try {
      await deleteFile(file.path);
      removeFile(file.id);
      setShowActionSheet(false);
      setSelectedFileForAction(null);
    } catch (error) {
      Alert.alert(
        'Delete Error',
        'Unable to delete file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [deleteFile, removeFile]);
  
  // Handle navigation to results
  const handleViewResults = useCallback(() => {
    navigation.navigate('Results', {});
  }, [navigation]);
  
  // Handle navigation to settings
  const handleOpenSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);
  
  // Action sheet options
  const actionSheetOptions = [
    {
      label: 'Remove from List',
      onPress: () => selectedFileForAction && handleRemoveFile(selectedFileForAction),
      variant: 'secondary' as const,
    },
    {
      label: 'Delete File',
      onPress: () => selectedFileForAction && handleDeleteFile(selectedFileForAction),
      variant: 'danger' as const,
    },
  ];
  
  // Render device status warning
  const renderDeviceStatus = () => {
    if (thermalState === 'critical' || thermalState === 'serious') {
      return (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTextDanger}>
            Device is overheating. Please let it cool down before converting.
          </Text>
        </View>
      );
    }

    if (availableStorage !== null && availableStorage < 1000000000) { // Less than 1GB
      return (
        <View style={styles.cautionContainer}>
          <Text style={styles.warningTextCaution}>
            Low storage space. Consider freeing up space before converting.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Video Converter
          </Text>
          <Pressable
            onPress={handleOpenSettings}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsIcon}>Settings</Text>
          </Pressable>
        </View>
        <Text style={styles.headerSubtitle}>
          Convert videos to web-optimized MP4
        </Text>
      </View>

      {/* Device Status Warnings */}
      {renderDeviceStatus()}

      {/* Progress Card */}
      {isProcessing && currentJob && currentJob.request?.inputFile && (
        <View style={styles.progressContainer}>
          <ProgressCard
            videoFile={{
              filename: currentJob.request.inputFile.name || 'Unknown',
              size: currentJob.request.inputFile.size || 0,
              duration: (currentJob.request.inputFile.metadata?.duration || 0) / 1000,
              resolution: `${currentJob.request.inputFile.metadata?.width || 0}x${currentJob.request.inputFile.metadata?.height || 0}`,
              format: currentJob.request.inputFile.mimeType?.split('/')[1]?.toUpperCase() || 'VIDEO'
            }}
            status="converting"
            progress={{
              percentage: progress?.percentage || 0,
              estimatedTimeRemaining: progress?.estimatedTimeRemaining || 0,
              phase: 'converting' as const
            }}
            onCancel={handleCancelConversion}
          />
        </View>
      )}

      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        {/* File Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Selected Files ({selectedFiles.length})
            </Text>
            {selectedVideoFiles.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onPress={clearFiles}
              >
                Clear All
              </Button>
            )}
          </View>

          {selectedFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>Video</Text>
              <Text style={styles.emptyText}>
                No videos selected
              </Text>
              <Text style={styles.emptyText}>
                Tap the button below to get started
              </Text>
              <Button
                variant="primary"
                onPress={handleSelectFiles}
              >
                Select Videos
              </Button>
            </View>
          ) : (
            <View style={styles.fileList}>
              {selectedVideoFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  state="normal"
                  onPress={() => handleFilePress(file)}
                />
              ))}

              <Button
                variant="secondary"
                onPress={handleSelectFiles}
              >
                Add More Videos
              </Button>
            </View>
          )}
        </View>

        {/* Conversion Controls */}
        {selectedVideoFiles.length > 0 && !isProcessing && (
          <View style={styles.section}>
            <Button
              variant="primary"
              onPress={() => setShowConversionForm(true)}
              disabled={thermalState === 'critical'}
            >
              Start Conversion
            </Button>
          </View>
        )}

        {/* Recent Results */}
        {processedFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recent Results ({processedFiles.length})
              </Text>
              <Button
                variant="secondary"
                size="sm"
                onPress={handleViewResults}
              >
                View All
              </Button>
            </View>

            <View style={styles.fileList}>
              {processedFiles.slice(0, 3).map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  state="normal"
                  onPress={() => handleFilePress(file)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Conversion Form Modal */}
      {showConversionForm && (
        <ConversionForm
          visible={showConversionForm}
          onCancel={() => setShowConversionForm(false)}
          onSubmit={handleStartConversion}
        />
      )}
      
      {/* Action Sheet */}
      {showActionSheet && selectedFileForAction && (
        <ActionSheet
          visible={showActionSheet}
          title={selectedFileForAction.name}
          sections={[{
            actions: actionSheetOptions.map(option => ({
              id: option.label,
              label: option.label,
              destructive: option.variant === 'danger',
              onPress: option.onPress
            }))
          }]}
          onDismiss={() => {
            setShowActionSheet(false);
            setSelectedFileForAction(null);
          }}
        />
      )}
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  warningContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  warningTextDanger: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '500',
  },
  cautionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  warningTextCaution: {
    color: '#a16207',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  fileList: {
    gap: 12,
  },
});