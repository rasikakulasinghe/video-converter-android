/**
 * @fileoverview useVideoProcessor hook
 * Provides video processing operations using the VideoProcessorService
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';

import type {
  VideoProcessorService,
  ConversionSession,
  ConversionEvent
} from '../services/VideoProcessorService';
import { ConversionEventType, SessionState } from '../services/VideoProcessorService';
import { ThermalState } from '../types/models/DeviceCapabilities';
import type { ConversionRequest, ConversionResult, VideoFile } from '../types/models';

/**
 * Video processor hook return type
 */
export interface UseVideoProcessorReturn {
  /** Whether a conversion is currently in progress */
  isProcessing: boolean;
  /** Current conversion progress (0-100) */
  progress: number;
  /** Current conversion session if active */
  currentSession: ConversionSession | null;
  /** Start a video conversion */
  startConversion: (request: ConversionRequest) => Promise<ConversionSession | null>;
  /** Convert video (alias for startConversion for compatibility) */
  convertVideo: (request: ConversionRequest) => Promise<ConversionSession | null>;
  /** Cancel the current conversion */
  cancelConversion: () => Promise<boolean>;
  /** Pause the current conversion */
  pauseConversion: () => Promise<boolean>;
  /** Resume the current conversion */
  resumeConversion: () => Promise<boolean>;
  /** Get conversion result */
  getResult: (sessionId: string) => Promise<ConversionResult | null>;
  /** Analyze video file metadata */
  analyzeVideo: (videoFile: VideoFile) => Promise<any>;
}

/**
 * Custom hook for video processing operations
 */
export const useVideoProcessor = (
  videoProcessorService?: VideoProcessorService
): UseVideoProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSession, setCurrentSession] = useState<ConversionSession | null>(null);
  
  const serviceRef = useRef<VideoProcessorService | null>(videoProcessorService || null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSession && serviceRef.current) {
        serviceRef.current.cancelConversion(currentSession.id).catch(console.error);
      }
    };
  }, [currentSession]);

  /**
   * Handle conversion events and update state
   */
  const handleConversionEvent = useCallback((event: ConversionEvent) => {
    switch (event.type) {
      case ConversionEventType.SESSION_CREATED:
        // Session created - no action needed
        break;
      
      case ConversionEventType.CONVERSION_STARTED:
        setIsProcessing(true);
        setProgress(0);
        break;
      
      case ConversionEventType.PROGRESS_UPDATE:
        if (event.data && typeof event.data === 'object' && 'percentage' in event.data) {
          setProgress(event.data.percentage as number);
        }
        break;
      
      case ConversionEventType.CONVERSION_COMPLETED:
        setIsProcessing(false);
        setProgress(100);
        setCurrentSession(null);
        break;
      
      case ConversionEventType.CONVERSION_FAILED:
        setIsProcessing(false);
        setProgress(0);
        setCurrentSession(null);
        Alert.alert('Conversion Failed', 'The video conversion encountered an error.');
        break;
      
      case ConversionEventType.CONVERSION_CANCELLED:
        setIsProcessing(false);
        setProgress(0);
        setCurrentSession(null);
        break;
      
      default:
        break;
    }
  }, []);

  /**
   * Start a video conversion
   */
  const startConversion = useCallback(async (
    request: ConversionRequest
  ): Promise<ConversionSession | null> => {
    if (!serviceRef.current) {
      Alert.alert('Error', 'Video processor service not available');
      return null;
    }

    if (isProcessing) {
      Alert.alert('Warning', 'A conversion is already in progress');
      return null;
    }

    try {
      const session = await serviceRef.current.createSession(request);
      setCurrentSession(session);
      
      // Start the conversion with options  
      await serviceRef.current.startConversion(session.id, {
        deviceCapabilities: {
          id: 'default-device',
          deviceModel: 'Unknown',
          androidVersion: '11',
          apiLevel: 30,
          architecture: 'arm64-v8a',
          lastUpdated: new Date(),
          battery: {
            level: 0.8,
            isCharging: false,
            health: 'good',
            temperature: 25,
            voltage: 3.7,
            capacity: 4000,
          },
          memory: {
            totalRam: 4 * 1024 * 1024 * 1024,
            availableRam: 2 * 1024 * 1024 * 1024,
            usedRam: 2 * 1024 * 1024 * 1024,
            totalStorage: 64 * 1024 * 1024 * 1024,
            availableStorage: 32 * 1024 * 1024 * 1024,
            usedStorage: 32 * 1024 * 1024 * 1024,
            isLowMemory: false,
          },
          thermal: {
            state: ThermalState.NORMAL,
            temperature: 25,
            throttleLevel: 0,
            maxSafeTemperature: 85,
          },
          processor: {
            cores: 8,
            maxFrequency: 2400,
            currentFrequency: 1800,
            usage: 30,
            architecture: 'arm64',
          },
          performance: {
            benchmark: 85,
            videoProcessingScore: 80,
            thermalEfficiency: 90,
            batteryEfficiency: 85,
          },
        },
        maxConcurrentSessions: 1,
        enableHardwareAcceleration: true,
        useGpuAcceleration: false,
        qualityPreference: 'balanced',
        powerSavingMode: false,
        thermalMonitoring: true,
        progressUpdateInterval: 1000,
        tempDirectory: '/tmp',
        onProgress: handleConversionEvent,
      });
      
      return session;
    } catch (error) {
      console.error('Error starting conversion:', error);
      Alert.alert('Error', 'Failed to start video conversion');
      return null;
    }
  }, [isProcessing, handleConversionEvent]);

  /**
   * Cancel the current conversion
   */
  const cancelConversion = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current || !currentSession) {
      return false;
    }

    try {
      await serviceRef.current.cancelConversion(currentSession.id);
      setIsProcessing(false);
      setProgress(0);
      setCurrentSession(null);
      return true;
    } catch (error) {
      console.error('Error cancelling conversion:', error);
      return false;
    }
  }, [currentSession]);

  /**
   * Pause the current conversion
   */
  const pauseConversion = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current || !currentSession) {
      return false;
    }

    try {
      await serviceRef.current.pauseConversion(currentSession.id);
      return true;
    } catch (error) {
      console.error('Error pausing conversion:', error);
      return false;
    }
  }, [currentSession]);

  /**
   * Resume the current conversion
   */
  const resumeConversion = useCallback(async (): Promise<boolean> => {
    if (!serviceRef.current || !currentSession) {
      return false;
    }

    try {
      await serviceRef.current.resumeConversion(currentSession.id);
      return true;
    } catch (error) {
      console.error('Error resuming conversion:', error);
      return false;
    }
  }, [currentSession]);

  /**
   * Get conversion result for a session
   */
  const getResult = useCallback(async (sessionId: string): Promise<ConversionResult | null> => {
    if (!serviceRef.current) {
      return null;
    }

    try {
      const session = await serviceRef.current.getSessionStatus(sessionId);
      
      // Convert session to result if completed
      if (session.state === SessionState.COMPLETED && session.result) {
        return session.result;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting conversion result:', error);
      return null;
    }
  }, []);

  /**
   * Analyze video file metadata
   */
  const analyzeVideo = useCallback(async (videoFile: VideoFile): Promise<any> => {
    if (!serviceRef.current) {
      return null;
    }

    try {
      return await serviceRef.current.analyzeVideo(videoFile.path);
    } catch (error) {
      console.error('Error analyzing video:', error);
      return null;
    }
  }, []);

  return {
    isProcessing,
    progress,
    currentSession,
    startConversion,
    convertVideo: startConversion, // Alias for compatibility
    cancelConversion,
    pauseConversion,
    resumeConversion,
    getResult,
    analyzeVideo,
  };
};