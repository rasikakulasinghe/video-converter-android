/**
 * Debug test for file store
 */

import { useFileStore } from '../../src/stores/fileStore';
import { VideoFile } from '../../src/types/models';

const mockVideoFile: VideoFile = {
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

describe('FileStore Debug', () => {
  it('should add file to store', () => {
    console.log('Initial state:', useFileStore.getState().videoFiles);
    
    useFileStore.getState().addFile(mockVideoFile);
    
    console.log('After adding file:', useFileStore.getState().videoFiles);
    
    expect(useFileStore.getState().videoFiles).toHaveLength(1);
  });
});