/**
 * @fileoverview Integration tests for end-to-end video conversion workflow
 * Tests the complete user journey from file selection to conversion completion
 * 
 * Constitutional Requirements:
 * - Test Coverage: Integration test for core user scenario
 * - TDD Approach: Tests written before any missing integration code
 * - Mobile-Specific: Tests React Native video processing workflow
 */

import { jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Import stores and hooks
import { useConversionStore } from '../../src/stores/conversionStore';
import { useFileStore } from '../../src/stores/fileStore';
import { useDeviceStore } from '../../src/stores/deviceStore';
import { useVideoProcessor } from '../../src/hooks/useVideoProcessor';
import { useFileManager } from '../../src/hooks/useFileManager';

// Import types
import type { VideoFile, ConversionRequest, ConversionSettings } from '../../src/types/models';
import { VideoQuality, OutputFormat } from '../../src/types/models';

// Mock React Native modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'android',
  },
}));

// Mock FFmpeg Kit
jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: {
    executeAsync: jest.fn(),
    cancel: jest.fn(),
  },
  ReturnCode: {
    SUCCESS: 0,
    CANCEL: 255,
  },
}));

// Mock React Native FS
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/cache',
  TemporaryDirectoryPath: '/mock/temp',
  ExternalDirectoryPath: '/mock/external',
  exists: jest.fn(() => Promise.resolve(true)),
  stat: jest.fn(() => Promise.resolve({
    size: 10485760, // 10MB
    isFile: () => true,
    isDirectory: () => false,
    mtime: new Date(),
    ctime: new Date(),
  })),
  copyFile: jest.fn(() => Promise.resolve()),
  moveFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
}));

// Mock Device Info
jest.mock('react-native-device-info', () => ({
  getBatteryLevel: jest.fn(() => Promise.resolve(0.8)),
  getPowerState: jest.fn(() => Promise.resolve({ batteryLevel: 0.8 })),
  getFreeDiskStorage: jest.fn(() => Promise.resolve(1073741824)), // 1GB
  getTotalMemory: jest.fn(() => Promise.resolve(4294967296)), // 4GB
  getUsedMemory: jest.fn(() => Promise.resolve(2147483648)), // 2GB
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('VideoConversion Integration Tests', () => {
  // Test data
  const mockVideoFile: VideoFile = {
    id: 'test-video-1',
    uri: '/mock/videos/test-video.mp4',
    name: 'test-video.mp4',
    size: 10485760, // 10MB
    mimeType: 'video/mp4',
    dateModified: new Date(),
    metadata: {
      duration: 30000, // 30 seconds
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 2000000,
      codec: 'h264',
    },
  };

  const mockConversionSettings: ConversionSettings = {
    quality: VideoQuality.HIGH,
    outputFormat: OutputFormat.MP4,
    targetFileSize: undefined,
    customBitrate: undefined,
    customResolution: undefined,
  };

  beforeEach(() => {
    // Reset all stores before each test
    useConversionStore.getState().reset();
    useFileStore.getState().clearFiles();
    useDeviceStore.getState().reset();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Complete Video Conversion Workflow', () => {
    it('should successfully convert a video from selection to completion', async () => {
      // Step 1: File Selection
      const { result: fileManagerResult } = renderHook(() => useFileManager());
      
      await act(async () => {
        await fileManagerResult.current.selectVideoFile();
      });

      // Verify file was added to store
      expect(useFileStore.getState().selectedFiles).toHaveLength(1);
      expect(useFileStore.getState().selectedFiles[0]).toEqual(
        expect.objectContaining({
          name: mockVideoFile.name,
          mimeType: mockVideoFile.mimeType,
        })
      );

      // Step 2: Device Resource Check
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());
      
      // Check device capabilities before conversion
      await act(async () => {
        await videoProcessorResult.current.checkDeviceCapabilities();
      });

      const deviceState = useDeviceStore.getState();
      expect(deviceState.capabilities.hasFFmpegSupport).toBe(true);
      expect(deviceState.capabilities.availableStorage).toBeGreaterThan(0);
      expect(deviceState.currentResources.batteryLevel).toBeGreaterThan(0.2);

      // Step 3: Start Conversion
      const conversionRequest: ConversionRequest = {
        id: 'conversion-1',
        inputFile: mockVideoFile,
        settings: mockConversionSettings,
        outputPath: '/mock/output/converted-video.mp4',
        priority: 'normal',
        createdAt: new Date(),
      };

      await act(async () => {
        await videoProcessorResult.current.startConversion(conversionRequest);
      });

      // Verify conversion started
      const conversionState = useConversionStore.getState();
      expect(conversionState.currentJob).toBeTruthy();
      expect(conversionState.currentJob?.id).toBe(conversionRequest.id);
      expect(conversionState.isProcessing).toBe(true);

      // Step 4: Monitor Progress
      await waitFor(() => {
        const progress = useConversionStore.getState().progress;
        expect(progress.percentage).toBeGreaterThan(0);
      }, { timeout: 5000 });

      // Step 5: Conversion Completion
      await act(async () => {
        // Simulate conversion completion
        const store = useConversionStore.getState();
        store.updateProgress({
          percentage: 100,
          estimatedTimeRemaining: 0,
          currentStage: 'finalizing',
          processingSpeed: 2.0,
        });
        store.completeConversion();
      });

      // Verify completion
      const finalState = useConversionStore.getState();
      expect(finalState.isProcessing).toBe(false);
      expect(finalState.currentJob).toBeNull();
      expect(finalState.completedJobs).toHaveLength(1);
      expect(finalState.completedJobs[0].id).toBe(conversionRequest.id);
    });

    it('should handle conversion errors gracefully', async () => {
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());
      
      const conversionRequest: ConversionRequest = {
        id: 'conversion-error-1',
        inputFile: mockVideoFile,
        settings: mockConversionSettings,
        outputPath: '/mock/output/error-video.mp4',
        priority: 'normal',
        createdAt: new Date(),
      };

      // Mock FFmpeg failure
      const { FFmpegKit } = require('ffmpeg-kit-react-native');
      FFmpegKit.executeAsync.mockImplementationOnce(() => {
        throw new Error('FFmpeg processing failed');
      });

      await act(async () => {
        try {
          await videoProcessorResult.current.startConversion(conversionRequest);
        } catch (error) {
          // Error should be handled gracefully
        }
      });

      // Verify error handling
      const conversionState = useConversionStore.getState();
      expect(conversionState.isProcessing).toBe(false);
      expect(conversionState.error).toBeTruthy();
      expect(conversionState.failedJobs).toHaveLength(1);
    });

    it('should handle conversion cancellation', async () => {
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());
      
      const conversionRequest: ConversionRequest = {
        id: 'conversion-cancel-1',
        inputFile: mockVideoFile,
        settings: mockConversionSettings,
        outputPath: '/mock/output/cancel-video.mp4',
        priority: 'normal',
        createdAt: new Date(),
      };

      // Start conversion
      await act(async () => {
        await videoProcessorResult.current.startConversion(conversionRequest);
      });

      // Cancel conversion
      await act(async () => {
        await videoProcessorResult.current.cancelConversion();
      });

      // Verify cancellation
      const conversionState = useConversionStore.getState();
      expect(conversionState.isProcessing).toBe(false);
      expect(conversionState.currentJob).toBeNull();
    });
  });

  describe('Multiple File Conversion Queue', () => {
    it('should process multiple files in queue order', async () => {
      const { result: fileManagerResult } = renderHook(() => useFileManager());
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      // Add multiple files
      const files = [
        { ...mockVideoFile, id: 'video-1', name: 'video1.mp4' },
        { ...mockVideoFile, id: 'video-2', name: 'video2.mp4' },
        { ...mockVideoFile, id: 'video-3', name: 'video3.mp4' },
      ];

      await act(async () => {
        for (const file of files) {
          await fileManagerResult.current.addVideoFile(file);
        }
      });

      // Start batch conversion
      await act(async () => {
        await videoProcessorResult.current.startBatchConversion(files.map(file => ({
          id: `conversion-${file.id}`,
          inputFile: file,
          settings: mockConversionSettings,
          outputPath: `/mock/output/${file.name}`,
          priority: 'normal',
          createdAt: new Date(),
        })));
      });

      // Verify queue processing
      const conversionState = useConversionStore.getState();
      expect(conversionState.queue).toHaveLength(3);
      expect(conversionState.isProcessing).toBe(true);
    });
  });

  describe('Storage Management Integration', () => {
    it('should check storage before starting conversion', async () => {
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());
      
      // Mock insufficient storage
      const DeviceInfo = require('react-native-device-info');
      DeviceInfo.getFreeDiskStorage.mockResolvedValueOnce(100000); // 100KB only

      const conversionRequest: ConversionRequest = {
        id: 'conversion-storage-1',
        inputFile: mockVideoFile,
        settings: mockConversionSettings,
        outputPath: '/mock/output/storage-video.mp4',
        priority: 'normal',
        createdAt: new Date(),
      };

      await act(async () => {
        try {
          await videoProcessorResult.current.startConversion(conversionRequest);
        } catch (error) {
          expect(error).toEqual(
            expect.objectContaining({
              type: 'INSUFFICIENT_STORAGE',
            })
          );
        }
      });

      // Verify conversion didn't start
      const conversionState = useConversionStore.getState();
      expect(conversionState.isProcessing).toBe(false);
    });
  });
});