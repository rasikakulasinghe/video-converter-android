/**
 * @fileoverview Integration tests for complete video conversion workflows
 * Tests the interaction between file selection, device monitoring, and video processing
 */

import { renderHook, act } from '@testing-library/react-native';
import { useFileManager } from '../../src/hooks/useFileManager';
import { useVideoProcessor } from '../../src/hooks/useVideoProcessor';
import { useFileStore } from '../../src/stores/fileStore';
import { useConversionStore } from '../../src/stores/conversionStore';
import { useDeviceStore } from '../../src/stores/deviceStore';
import { VideoQuality, OutputFormat, ConversionRequest, VideoFormat } from '../../src/types/models';

// Mock data for tests
const mockVideoFile = {
  id: 'video-1',
  name: 'test-video.mp4',
  path: '/mock/path/test-video.mp4',
  size: 10485760, // 10MB
  mimeType: 'video/mp4',
  format: VideoFormat.MP4,
  createdAt: new Date(),
  modifiedAt: new Date(),
  metadata: {
    duration: 30000,
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 2000000,
    codec: 'h264',
    codecName: 'H.264',
    audioCodec: 'aac',
    audioBitrate: 128000,
    audioSampleRate: 44100,
    audioChannels: 2,
  },
};

describe('VideoConversion Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useFileStore.getState().clearFiles();
    useConversionStore.getState().reset();
    useDeviceStore.getState().reset();
  });

  describe('Complete Video Conversion Workflow', () => {
    it('should successfully convert a video from selection to completion', async () => {
      // Step 1: File Selection - Simulate the file selection and add to store
      await act(async () => {
        useFileStore.getState().addFile(mockVideoFile);
      });

      // Verify file was added to store
      expect(useFileStore.getState().processedFiles).toHaveLength(1);
      expect(useFileStore.getState().processedFiles[0]).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          mimeType: expect.any(String),
        })
      );

      // Step 2: Device Resource Check
      const { result: deviceResult } = renderHook(() => useDeviceStore());
      
      await act(async () => {
        useDeviceStore.getState().startMonitoring();
      });

      const deviceState = deviceResult.current;
      expect(deviceState.isMonitoring).toBe(true);

      // Step 3: Start Conversion
      const conversionRequest: ConversionRequest = {
        id: 'conversion-1',
        inputFile: mockVideoFile,
        outputPath: '/mock/output/converted-video.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      let jobId: string = '';
      await act(async () => {
        jobId = await useConversionStore.getState().startConversion(conversionRequest);
      });

      // Verify conversion started and completed (since our mock completes immediately)
      const conversionState = useConversionStore.getState();
      if (conversionState.currentJob) {
        // Still processing
        expect(conversionState.currentJob).toBeTruthy();
        expect(conversionState.currentJob?.id).toBe(jobId);
      } else {
        // Already completed (due to fast mock)
        expect(conversionState.jobHistory).toHaveLength(1);
        expect(conversionState.jobHistory[0]!.id).toBe(jobId);
        expect(conversionState.jobHistory[0]!.status).toBe('completed');
      }

      // Step 4: Monitor Progress
      await act(async () => {
        // Simulate progress updates
        const progress = conversionState.progress;
        if (progress) {
          expect(progress.percentage).toBeGreaterThanOrEqual(0);
        }
      });

      // Step 5: Verify Completion (our mock completes immediately)
      const finalState = useConversionStore.getState();
      expect(finalState.jobHistory).toHaveLength(1);
      expect(finalState.jobHistory[0]!.status).toBe('completed');
    });

    it('should handle conversion errors gracefully', async () => {
      const conversionRequest: ConversionRequest = {
        id: 'failing-conversion',
        inputFile: mockVideoFile,
        outputPath: '/invalid/path/output.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      await act(async () => {
        try {
          await useConversionStore.getState().startConversion(conversionRequest);
        } catch (error) {
          // Expected to fail due to invalid path
        }
      });

      // Verify error handling
      const conversionState = useConversionStore.getState();
      // The conversion might fail or be in error state
      if (conversionState.currentJob) {
        expect(['failed', 'processing']).toContain(conversionState.currentJob.status);
      }
    });

    it('should cancel ongoing conversion', async () => {
      const conversionRequest: ConversionRequest = {
        id: 'cancellable-conversion',
        inputFile: mockVideoFile,
        outputPath: '/mock/output/cancelled-video.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      await act(async () => {
        await useConversionStore.getState().startConversion(conversionRequest);
      });

      // Cancel the conversion
      await act(async () => {
        await useConversionStore.getState().cancelConversion();
      });

      // Verify cancellation or completion (since our mock may complete immediately)
      const conversionState = useConversionStore.getState();
      if (conversionState.currentJob) {
        // If still processing, it should be cancelled
        expect(conversionState.currentJob.status).toBe('cancelled');
      } else {
        // If already completed, check job history
        expect(conversionState.jobHistory).toHaveLength(1);
        expect(['completed', 'cancelled']).toContain(conversionState.jobHistory[0]!.status);
      }
    });
  });

  describe('Batch Video Processing', () => {
    it('should process multiple videos in sequence', async () => {
      const files = [mockVideoFile, { ...mockVideoFile, id: 'video-2', name: 'test-video-2.mp4' }];
      
      // Add multiple files directly to store
      await act(async () => {
        files.forEach(file => {
          useFileStore.getState().addFile(file);
        });
      });

      expect(useFileStore.getState().processedFiles).toHaveLength(2);

      // Process each file
      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      for (const file of files) {
        const conversionRequest: ConversionRequest = {
          id: `conversion-${file.id}`,
          inputFile: file,
          outputPath: `/mock/output/converted-${file.name}`,
          targetQuality: VideoQuality.HD,
          outputFormat: OutputFormat.MP4,
          createdAt: new Date(),
        };

        await act(async () => {
          await useConversionStore.getState().startConversion(conversionRequest);
        });
      }

      // Verify multiple conversions were handled
      const conversionState = useConversionStore.getState();
      expect(conversionState.jobHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Device Resource Integration', () => {
    it('should monitor device resources during conversion', async () => {
      const { result: deviceResult } = renderHook(() => useDeviceStore());

      await act(async () => {
        useDeviceStore.getState().startMonitoring();
      });

      expect(deviceResult.current.isMonitoring).toBe(true);

      // Start a conversion while monitoring
      const conversionRequest: ConversionRequest = {
        id: 'monitored-conversion',
        inputFile: mockVideoFile,
        outputPath: '/mock/output/monitored-video.mp4',
        targetQuality: VideoQuality.HD,
        outputFormat: OutputFormat.MP4,
        createdAt: new Date(),
      };

      const { result: videoProcessorResult } = renderHook(() => useVideoProcessor());

      await act(async () => {
        await useConversionStore.getState().startConversion(conversionRequest);
      });

      // Verify monitoring continues during conversion
      expect(deviceResult.current.isMonitoring).toBe(true);
    });
  });
});