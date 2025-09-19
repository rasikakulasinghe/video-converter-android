import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, Alert, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { FileCard } from '../components/molecules/FileCard';
import { ProgressCard } from '../components/molecules/ProgressCard';
import { ConversionForm } from '../components/molecules/ConversionForm';
import { ActionSheet } from '../components/molecules/ActionSheet';

import { useConversionStore } from '../stores/conversionStore';
import { useFileStore } from '../stores/fileStore';
import { useDeviceStore } from '../stores/deviceStore';
import { useFileManager } from '../hooks/useFileManager';
import { useVideoProcessor } from '../hooks/useVideoProcessor';

import type { VideoFile, ConversionRequest, ConversionSettings } from '../types/models';
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
    isLowPowerMode,
    availableStorage,
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
    if (isLowPowerMode) {
      Alert.alert(
        'Low Power Mode',
        'Device is in low power mode. Conversion may be slower than usual.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => proceedWithConversion(settings) },
        ]
      );
      return;
    }
    
    if (batteryLevel < 0.2) {
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
  }, [selectedFiles, isLowPowerMode, batteryLevel]);
  
  const proceedWithConversion = useCallback(async (settings: ConversionSettings) => {
    try {
      const request: ConversionRequest = {
        files: selectedVideoFiles,
        settings,
        timestamp: Date.now(),
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
  }, [selectedFiles, startConversion]);
  
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
    navigation.navigate('Results');
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
        <View className="mx-4 mb-4 p-3 bg-red-100 rounded-lg border border-red-300">
          <Text className="text-red-700 text-sm font-medium">
            ⚠️ Device is overheating. Please let it cool down before converting.
          </Text>
        </View>
      );
    }
    
    if (availableStorage < 1000000000) { // Less than 1GB
      return (
        <View className="mx-4 mb-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
          <Text className="text-yellow-700 text-sm font-medium">
            ⚠️ Low storage space. Consider freeing up space before converting.
          </Text>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">
            Video Converter
          </Text>
          <Pressable
            onPress={handleOpenSettings}
            className="p-2 rounded-lg bg-gray-100"
          >
            <Text className="text-gray-600">⚙️</Text>
          </Pressable>
        </View>
        <Text className="text-gray-600 mt-1">
          Convert videos to web-optimized MP4
        </Text>
      </View>
      
      {/* Device Status Warnings */}
      {renderDeviceStatus()}
      
      {/* Progress Card */}
      {isProcessing && currentJob && (
        <View className="mx-4 mb-4">
          <ProgressCard
            progress={progress}
            onCancel={handleCancelConversion}
            onViewDetails={() => {}}
          />
        </View>
      )}
      
      {/* Main Content */}
      <ScrollView className="flex-1 px-4">
        {/* File Selection */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
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
            <View className="py-12 items-center">
              <Text className="text-6xl mb-4">📹</Text>
              <Text className="text-gray-500 text-center mb-4">
                No videos selected{'\n'}
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
            <View className="space-y-3">
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
          <View className="mb-6">
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
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
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
            
            <View className="space-y-3">
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