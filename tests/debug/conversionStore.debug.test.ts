/**
 * Debug test for conversion store
 */

import { useConversionStore } from '../../src/stores/conversionStore';
import { VideoQuality, OutputFormat, ConversionRequest } from '../../src/types/models';

const mockVideoFile = {
  id: 'video-1',
  name: 'test-video.mp4',
  path: '/mock/path/test-video.mp4',
  size: 10485760,
  mimeType: 'video/mp4',
  createdAt: new Date(),
  metadata: {
    duration: 30000,
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 2000000,
    codec: 'h264',
    audioCodec: 'aac',
    audioBitrate: 128000,
    audioSampleRate: 44100,
    audioChannels: 2,
  },
};

const conversionRequest: ConversionRequest = {
  id: 'conversion-1',
  inputFile: mockVideoFile,
  outputPath: '/mock/output/converted-video.mp4',
  targetQuality: VideoQuality.HD,
  outputFormat: OutputFormat.MP4,
  priority: 'normal',
  createdAt: new Date(),
};

describe('ConversionStore Debug', () => {
  beforeEach(() => {
    useConversionStore.getState().reset();
  });

  it('should start conversion and create currentJob', async () => {
    console.log('Initial state:', useConversionStore.getState().currentJob);
    
    let jobId = '';
    try {
      jobId = await useConversionStore.getState().startConversion(conversionRequest);
      console.log('Job ID returned:', jobId);
    } catch (error) {
      console.log('Error starting conversion:', error);
    }
    
    console.log('After starting conversion:', {
      currentJob: useConversionStore.getState().currentJob,
      jobHistory: useConversionStore.getState().jobHistory,
      isProcessing: useConversionStore.getState().isProcessing
    });
    
    expect(useConversionStore.getState().currentJob).toBeTruthy();
  });
});