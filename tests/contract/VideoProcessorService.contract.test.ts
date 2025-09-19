/**
 * @fileoverview Contract tests for VideoProcessorService interface
 * Validates that implementations conform to the service contract
 * 
 * Constitutional Requirements:
 * - TDD Approach: Contract tests validate service interfaces
 * - TypeScript Excellence: Strict interface compliance testing
 * - Test Coverage: Service contract validation
 */

import { jest } from '@jest/globals';

// Import service interface and implementation
import { VideoProcessorService } from '../../src/services/VideoProcessorService';
import { FFmpegVideoProcessor } from '../../src/services/implementations/FFmpegVideoProcessor';

// Import types
import type { ConversionRequest } from '../../src/types/models';
import { VideoQuality, OutputFormat } from '../../src/types/models';

// Mock external dependencies
jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: {
    execute: jest.fn().mockResolvedValue({
      getReturnCode: () => ({ getValue: () => 0 }),
      getOutput: () => 'frame=100 fps=30.0 q=28.0 size=1024kB time=00:00:03.33 bitrate=2511.4kbits/s speed=1.0x',
    }),
    executeAsync: jest.fn(),
    cancel: jest.fn(),
    listSessions: jest.fn(() => []),
  },
  ReturnCode: {
    SUCCESS: 0,
    CANCEL: 255,
    isSuccess: jest.fn((code) => code === 0),
  },
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(() => Promise.resolve(true)),
  stat: jest.fn(() => Promise.resolve({ size: 1000000 })),
  getFSInfo: jest.fn(() => Promise.resolve({
    totalSpace: 64 * 1024 * 1024 * 1024, // 64GB
    freeSpace: 32 * 1024 * 1024 * 1024,  // 32GB available
  })),
  mkdir: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
}));

describe('VideoProcessorService Contract Tests', () => {
  let videoProcessor: VideoProcessorService;

  beforeEach(() => {
    videoProcessor = new FFmpegVideoProcessor();
    jest.clearAllMocks();
  });

  describe('Interface Compliance', () => {
    it('should implement VideoProcessorService interface', () => {
      expect(videoProcessor).toBeInstanceOf(FFmpegVideoProcessor);
      expect(videoProcessor).toBeDefined();
    });

    it('should have all required methods defined', () => {
      // Core processing methods
      expect(typeof videoProcessor.analyzeVideo).toBe('function');
      expect(typeof videoProcessor.createSession).toBe('function');
      expect(typeof videoProcessor.startConversion).toBe('function');
      expect(typeof videoProcessor.pauseConversion).toBe('function');
      expect(typeof videoProcessor.resumeConversion).toBe('function');
      expect(typeof videoProcessor.cancelConversion).toBe('function');
      expect(typeof videoProcessor.getSessionState).toBe('function');
      expect(typeof videoProcessor.cleanup).toBe('function');

      // Monitoring methods
      expect(typeof videoProcessor.getProgress).toBe('function');
      expect(typeof videoProcessor.onProgressUpdate).toBe('function');
      expect(typeof videoProcessor.onSessionComplete).toBe('function');
      expect(typeof videoProcessor.onError).toBe('function');

      // Capability methods
      expect(typeof videoProcessor.getSupportedFormats).toBe('function');
      expect(typeof videoProcessor.validateRequest).toBe('function');
      expect(typeof videoProcessor.estimateProcessingTime).toBe('function');
      expect(typeof videoProcessor.getOptimalSettings).toBe('function');
    });
  });

  describe('Method Return Types', () => {
    const mockRequest: ConversionRequest = {
      id: 'test-session-1',
      inputFile: {
        id: 'test-file',
        name: 'test.mp4',
        path: '/mock/test.mp4',
        size: 1000000,
        mimeType: 'video/mp4',
        createdAt: new Date(),
      },
      outputFormat: OutputFormat.MP4,
      targetQuality: VideoQuality.HD,
      outputPath: '/mock/output.mp4',
      priority: 'normal',
      createdAt: new Date(),
    };

    it('should return correct types for async methods', async () => {
      // analyzeVideo should return VideoMetadata
      const analysis = await videoProcessor.analyzeVideo('/mock/test.mp4');
      expect(typeof analysis).toBe('object');
      expect(typeof analysis.duration).toBe('number');
      expect(typeof analysis.width).toBe('number');
      expect(typeof analysis.height).toBe('number');

      // createSession should return ConversionSession
      const session = await videoProcessor.createSession(mockRequest);
      expect(typeof session).toBe('object');
      expect(typeof session.sessionId).toBe('string');
      expect(typeof session.request).toBe('object');

      // validateRequest should return ValidationResult
      const validation = await videoProcessor.validateRequest(mockRequest);
      expect(typeof validation).toBe('object');
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);

      // getSupportedFormats should return array
      const formats = await videoProcessor.getSupportedFormats();
      expect(Array.isArray(formats)).toBe(true);

      // estimateProcessingTime should return number
      const estimate = await videoProcessor.estimateProcessingTime(mockRequest);
      expect(typeof estimate).toBe('number');
    });

    it('should return correct types for synchronous methods', () => {
      // getSessionState should return SessionState enum
      const state = videoProcessor.getSessionState('test-session');
      expect(typeof state).toBe('string');

      // getProgress should return ConversionProgress
      const progress = videoProcessor.getProgress('test-session');
      expect(typeof progress).toBe('object');
      expect(typeof progress.percentage).toBe('number');
    });
  });

  describe('Method Contracts', () => {
    const mockRequest: ConversionRequest = {
      id: 'contract-test-1',
      inputFile: {
        id: 'test-file',
        name: 'test.mp4',
        path: '/mock/test.mp4',
        size: 1000000,
        mimeType: 'video/mp4',
        createdAt: new Date(),
      },
      outputFormat: OutputFormat.MP4,
      targetQuality: VideoQuality.HD,
      outputPath: '/mock/output.mp4',
      priority: 'normal',
      createdAt: new Date(),
    };

    it('should handle createSession contract correctly', async () => {
      const session = await videoProcessor.createSession(mockRequest);
      
      // Contract: createSession must return a session with unique ID
      expect(session.sessionId).toBeDefined();
      expect(typeof session.sessionId).toBe('string');
      expect(session.sessionId.length).toBeGreaterThan(0);
      
      // Contract: session should contain the original request
      expect(session.request).toEqual(mockRequest);
      
      // Contract: session should have initial state
      expect(session.state).toBeDefined();
      expect(['CREATED', 'VALIDATED', 'QUEUED'].includes(session.state)).toBe(true);
    });

    it('should handle startConversion contract correctly', async () => {
      const session = await videoProcessor.createSession(mockRequest);
      
      // Contract: startConversion should not throw for valid session
      await expect(
        videoProcessor.startConversion(session.sessionId, {})
      ).resolves.not.toThrow();
      
      // Contract: session state should change after starting
      const stateAfterStart = videoProcessor.getSessionState(session.sessionId);
      expect(['PROCESSING', 'QUEUED'].includes(stateAfterStart)).toBe(true);
    });

    it('should handle pause/resume contract correctly', async () => {
      const session = await videoProcessor.createSession(mockRequest);
      await videoProcessor.startConversion(session.sessionId, {});
      
      // Contract: pauseConversion should work for processing sessions
      await expect(
        videoProcessor.pauseConversion(session.sessionId)
      ).resolves.not.toThrow();
      
      // Contract: resumeConversion should work for paused sessions
      await expect(
        videoProcessor.resumeConversion(session.sessionId)
      ).resolves.not.toThrow();
    });

    it('should handle cancelConversion contract correctly', async () => {
      const session = await videoProcessor.createSession(mockRequest);
      
      // Contract: cancelConversion should work for any session
      await expect(
        videoProcessor.cancelConversion(session.sessionId)
      ).resolves.not.toThrow();
      
      // Contract: session state should be CANCELLED after cancellation
      const stateAfterCancel = videoProcessor.getSessionState(session.sessionId);
      expect(stateAfterCancel).toBe('CANCELLED');
    });

    it('should handle validateRequest contract correctly', async () => {
      // Contract: valid request should pass validation
      const validResult = await videoProcessor.validateRequest(mockRequest);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      // Contract: invalid request should fail validation
      const invalidRequest = {
        ...mockRequest,
        inputFile: {
          ...mockRequest.inputFile,
          path: '', // Invalid empty path
        },
      };
      
      const invalidResult = await videoProcessor.validateRequest(invalidRequest);
      expect(invalidResult.isValid).toBe(false);
      expect(validResult.errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Handling Contracts', () => {
    it('should support progress update callbacks', () => {
      const mockCallback = jest.fn();
      
      // Contract: onProgressUpdate should accept callback
      const unsubscribe = videoProcessor.onProgressUpdate(mockCallback);
      expect(typeof unsubscribe).toBe('function');
      
      // Contract: unsubscribe should work
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should support session completion callbacks', () => {
      const mockCallback = jest.fn();
      
      // Contract: onSessionComplete should accept callback
      const unsubscribe = videoProcessor.onSessionComplete(mockCallback);
      expect(typeof unsubscribe).toBe('function');
      
      // Contract: unsubscribe should work
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should support error callbacks', () => {
      const mockCallback = jest.fn();
      
      // Contract: onError should accept callback
      const unsubscribe = videoProcessor.onError(mockCallback);
      expect(typeof unsubscribe).toBe('function');
      
      // Contract: unsubscribe should work
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Error Handling Contracts', () => {
    it('should handle invalid session IDs gracefully', () => {
      const invalidSessionId = 'non-existent-session';
      
      // Contract: methods should handle invalid session IDs without crashing
      expect(() => videoProcessor.getSessionState(invalidSessionId)).not.toThrow();
      expect(() => videoProcessor.getProgress(invalidSessionId)).not.toThrow();
      
      // Contract: operations on invalid sessions should reject appropriately
      expect(
        videoProcessor.pauseConversion(invalidSessionId)
      ).rejects.toThrow();
      
      expect(
        videoProcessor.resumeConversion(invalidSessionId)
      ).rejects.toThrow();
      
      expect(
        videoProcessor.cancelConversion(invalidSessionId)
      ).rejects.toThrow();
    });

    it('should handle cleanup gracefully', async () => {
      // Contract: cleanup should not throw even if called multiple times
      await expect(videoProcessor.cleanup()).resolves.not.toThrow();
      await expect(videoProcessor.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Performance Contracts', () => {
    it('should respect timeout contracts', async () => {
      const mockRequest: ConversionRequest = {
        id: 'timeout-test',
        inputFile: {
          id: 'test-file',
          name: 'test.mp4',
          path: '/mock/test.mp4',
          size: 1000000,
          mimeType: 'video/mp4',
          createdAt: new Date(),
        },
        outputFormat: OutputFormat.MP4,
        targetQuality: VideoQuality.HD,
        outputPath: '/mock/output.mp4',
        priority: 'normal',
        createdAt: new Date(),
      };

      // Contract: analyzeVideo should complete within reasonable time
      const startTime = Date.now();
      await videoProcessor.analyzeVideo('/mock/test.mp4');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10000); // Less than 10 seconds
    });

    it('should handle memory contracts', async () => {
      // Contract: operations should not cause memory leaks
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const session = await videoProcessor.createSession({
          id: `memory-test-${i}`,
          inputFile: {
            id: 'test-file',
            name: 'test.mp4',
            path: '/mock/test.mp4',
            size: 1000000,
            mimeType: 'video/mp4',
            createdAt: new Date(),
          },
          outputFormat: OutputFormat.MP4,
          targetQuality: VideoQuality.HD,
          outputPath: `/mock/output-${i}.mp4`,
          priority: 'normal',
          createdAt: new Date(),
        });
        
        await videoProcessor.cancelConversion(session.sessionId);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Contract: memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});