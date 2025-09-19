import React, { useCallback } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

import { Text } from '../components/atoms/Text';
import { FileCard } from '../components/molecules/FileCard';

import type { RootStackParamList } from '../types/navigation';

interface ResultsScreenProps {}

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

/**
 * Results screen component for the video converter app.
 * Displays processed videos and conversion history.
 */
export const ResultsScreen: React.FC<ResultsScreenProps> = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ResultsRouteProp>();
  
  // Mock processed files for now
  const processedFiles = [
    {
      id: '1',
      name: 'vacation_video.mp4',
      path: '/storage/processed/vacation_video.mp4',
      size: 25600000,
      mimeType: 'video/mp4',
      createdAt: new Date(),
      metadata: {
        duration: 120000,
        width: 1920,
        height: 1080,
        frameRate: 30,
        bitrate: 2500000,
        codec: 'h264',
      },
    },
    {
      id: '2',
      name: 'presentation.mp4',
      path: '/storage/processed/presentation.mp4',
      size: 15800000,
      mimeType: 'video/mp4',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      metadata: {
        duration: 300000,
        width: 1280,
        height: 720,
        frameRate: 24,
        bitrate: 1800000,
        codec: 'h264',
      },
    },
  ];
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Handle file press
  const handleFilePress = useCallback((file: any) => {
    // Handle file actions like share, delete, etc.
    console.log('File pressed:', file.name);
  }, []);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
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
            Results
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          View processed videos and conversion history
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            Conversion Summary
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{processedFiles.length}</Text>
              <Text style={styles.statLabel}>Videos Processed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatFileSize(processedFiles.reduce((total, file) => total + file.size, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDuration(processedFiles.reduce((total, file) => total + file.metadata.duration, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Duration</Text>
            </View>
          </View>
        </View>
        
        {/* Processed Files */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Processed Videos ({processedFiles.length})
          </Text>
          
          {processedFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎬</Text>
              <Text style={styles.emptyText}>
                No processed videos yet{'\n'}
                Convert some videos to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.fileList}>
              {processedFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  state="completed"
                  onPress={() => handleFilePress(file)}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Quality Analysis */}
        {processedFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Quality Analysis
            </Text>
            
            <View style={styles.analysisCard}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Average Resolution</Text>
                <Text style={styles.analysisValue}>
                  {Math.round(processedFiles.reduce((total, file) => total + file.metadata.width, 0) / processedFiles.length)} x {Math.round(processedFiles.reduce((total, file) => total + file.metadata.height, 0) / processedFiles.length)}
                </Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Average Bitrate</Text>
                <Text style={styles.analysisValue}>
                  {Math.round(processedFiles.reduce((total, file) => total + file.metadata.bitrate, 0) / processedFiles.length / 1000)} kbps
                </Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Common Codec</Text>
                <Text style={styles.analysisValue}>H.264</Text>
              </View>
            </View>
          </View>
        )}
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
  summary: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fileList: {
    gap: 12,
  },
  analysisCard: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  analysisValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
});