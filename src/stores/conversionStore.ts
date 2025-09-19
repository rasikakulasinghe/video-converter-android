import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  VideoProcessorService, 
  ConversionSession, 
  ConversionProgress as ServiceProgress,
  ConversionEvent,
  ConversionEventType,
  SessionState 
} from '../services/VideoProcessorService';
import { FFmpegVideoProcessor } from '../services/implementations/FFmpegVideoProcessor';
import { 
  VideoFile, 
  ConversionRequest, 
  ConversionResult,
  ConversionProgress,
  ConversionStatus 
} from '../types/models';
import { ThermalState } from '../types/models/DeviceCapabilities';

/**
 * Extended progress interface with additional UI state
 */
interface UIConversionProgress extends ConversionProgress {
  /** Current processing phase */
  phase: string;
  /** Processing speed multiplier */
  speed: number;
  /** Bitrate as string for UI display */
  bitrateString: string;
  /** Current file size in bytes */
  currentSize: number;
}

/**
 * Conversion job state interface
 */
export interface ConversionJob {
  id: string;
  request: ConversionRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: UIConversionProgress;
  result?: ConversionResult;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  estimatedCompletionTime?: Date;
}

/**
 * Queue item interface
 */
export interface QueueItem {
  id: string;
  request: ConversionRequest;
  priority: number;
  addedAt: Date;
}

/**
 * Conversion statistics interface
 */
export interface ConversionStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  totalFilesProcessed: number;
  totalSizeProcessed: number;
  totalSizeReduced: number;
  successRate: number;
  lastProcessed?: Date;
}

/**
 * Conversion store state interface
 */
interface ConversionState {
  // Current job state
  currentJob: ConversionJob | null;
  jobHistory: ConversionJob[];
  
  // Current progress (computed from currentJob)
  progress: ConversionProgress | null;
  
  // Queue management
  queue: QueueItem[];
  isQueueActive: boolean;
  maxConcurrentJobs: number;
  
  // Processing state
  isProcessing: boolean;
  isPaused: boolean;
  canProcess: boolean; // Based on device health
  
  // Statistics and analytics
  stats: ConversionStats;
  
  // Settings and preferences
  autoStartQueue: boolean;
  notifyOnCompletion: boolean;
  deleteOriginalsAfterConversion: boolean;
  
  // Service instance
  videoProcessor: VideoProcessorService;
}

/**
 * Conversion store actions interface
 */
interface ConversionActions {
  // Job management
  startConversion: (request: ConversionRequest) => Promise<string>;
  cancelConversion: (jobId?: string) => Promise<boolean>;
  pauseConversion: () => Promise<boolean>;
  resumeConversion: () => Promise<boolean>;
  retryConversion: (jobId: string) => Promise<boolean>;
  clearJob: () => void;
  
  // Queue management
  addToQueue: (item: Omit<QueueItem, 'id' | 'addedAt'>) => string;
  removeFromQueue: (itemId: string) => boolean;
  clearQueue: () => void;
  reorderQueue: (itemIds: string[]) => void;
  startQueue: () => Promise<boolean>;
  stopQueue: () => Promise<boolean>;
  processNextInQueue: () => Promise<boolean>;
  
  // Progress tracking
  updateProgress: (jobId: string, progress: Partial<ConversionJob['progress']>) => void;
  updateJobStatus: (jobId: string, status: ConversionJob['status'], error?: string) => void;
  
  // Statistics
  updateStats: (jobResult: ConversionResult) => void;
  resetStats: () => void;
  
  // Settings
  updateSettings: (settings: Partial<Pick<ConversionState, 'autoStartQueue' | 'notifyOnCompletion' | 'deleteOriginalsAfterConversion' | 'maxConcurrentJobs'>>) => void;
  
  // Device compatibility
  checkDeviceReadiness: () => Promise<boolean>;
  
  // Utilities
  getJobById: (jobId: string) => ConversionJob | null;
  getQueuePosition: (itemId: string) => number;
  estimateQueueTime: () => number;
  exportJobHistory: () => string;
  clearHistory: () => void;
}

/**
 * Combined conversion store type
 */
type ConversionStore = ConversionState & ConversionActions;

/**
 * Create the conversion store with Zustand
 */
export const useConversionStore = create<ConversionStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentJob: null,
    jobHistory: [],
    
    // Current progress (computed from currentJob)
    progress: null,
    
    queue: [],
    isQueueActive: false,
    maxConcurrentJobs: 1,
    isProcessing: false,
    isPaused: false,
    canProcess: true,
    stats: {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      totalFilesProcessed: 0,
      totalSizeProcessed: 0,
      totalSizeReduced: 0,
      successRate: 0,
    },
    autoStartQueue: false,
    notifyOnCompletion: true,
    deleteOriginalsAfterConversion: false,
    videoProcessor: new FFmpegVideoProcessor(),

    // Actions
    startConversion: async (request: ConversionRequest): Promise<string> => {
      const { videoProcessor, currentJob } = get();

      // Check if already processing
      if (currentJob && currentJob.status === 'processing') {
        throw new Error('A conversion is already in progress');
      }

      // Create new job
      const job: ConversionJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        status: 'pending',
        progress: {
          percentage: 0,
          currentFrame: 0,
          totalFrames: 0,
          processedDuration: 0,
          totalDuration: 0,
          estimatedTimeRemaining: 0,
          currentBitrate: 0,
          averageFps: 0,
          phase: 'initializing',
          speed: 0,
          bitrateString: '0 kbps',
          currentSize: 0,
        },
        startTime: new Date(),
      };

      // Update state
      set(state => ({
        currentJob: job,
        progress: job.progress,
        isProcessing: true,
        stats: {
          ...state.stats,
          totalJobs: state.stats.totalJobs + 1,
        },
      }));

      try {
        // Create a session
        const session = await videoProcessor.createSession(request);
        
        // Start the conversion with progress tracking
        await videoProcessor.startConversion(session.id, {
          deviceCapabilities: {
            id: 'device_1',
            deviceModel: 'Android Device',
            androidVersion: '13',
            apiLevel: 33,
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
              totalRam: 4096 * 1024 * 1024,
              availableRam: 2048 * 1024 * 1024,
              usedRam: 2048 * 1024 * 1024,
              totalStorage: 64 * 1024 * 1024 * 1024,
              availableStorage: 32 * 1024 * 1024 * 1024,
              usedStorage: 32 * 1024 * 1024 * 1024,
              isLowMemory: false,
            },
            thermal: {
              state: ThermalState.NORMAL,
              temperature: 25,
              throttleLevel: 0,
              maxSafeTemperature: 70,
            },
            processor: {
              cores: 8,
              maxFrequency: 2400,
              currentFrequency: 1800,
              usage: 45,
              architecture: 'arm64',
            },
            performance: {
              benchmark: 75,
              videoProcessingScore: 70,
              thermalEfficiency: 90,
              batteryEfficiency: 85,
            },
          },
          maxConcurrentSessions: 1,
          enableHardwareAcceleration: false,
          useGpuAcceleration: false,
          qualityPreference: 'balanced',
          powerSavingMode: false,
          thermalMonitoring: true,
          progressUpdateInterval: 1000,
          tempDirectory: '/tmp',
          onProgress: (event: ConversionEvent) => {
            if (event.type === ConversionEventType.PROGRESS_UPDATE && event.data) {
              const serviceProgress = event.data as ServiceProgress;
              get().updateProgress(job.id, {
                percentage: serviceProgress.percentage,
                processedDuration: serviceProgress.processedDuration,
                totalDuration: serviceProgress.totalDuration,
                estimatedTimeRemaining: serviceProgress.estimatedTimeRemaining,
                phase: serviceProgress.currentPhase,
                speed: serviceProgress.processingSpeed,
              });
            }
          },
        });

        // Get the final session status
        const finalSession = await videoProcessor.getSessionStatus(session.id);
        
        // Create result from session data
        const result: ConversionResult = {
          id: finalSession.id,
          request: finalSession.request,
          status: finalSession.state === SessionState.COMPLETED ? ConversionStatus.COMPLETED : ConversionStatus.FAILED,
          progress: {
            percentage: finalSession.progress.percentage,
            currentFrame: 0, // Extended field for UI
            totalFrames: 0, // Extended field for UI
            processedDuration: finalSession.progress.processedDuration,
            totalDuration: finalSession.progress.totalDuration,
            estimatedTimeRemaining: finalSession.progress.estimatedTimeRemaining,
            currentBitrate: 0, // Extended field for UI
            averageFps: 0, // Extended field for UI
          },
          startTime: finalSession.createdAt,
          ...(finalSession.completedAt ? { endTime: finalSession.completedAt } : {}),
          ...(finalSession.result?.outputFile ? { outputFile: finalSession.result.outputFile } : {}),
          ...(finalSession.error ? {
            error: {
              code: finalSession.error.code,
              message: finalSession.error.message,
              severity: 'critical',
              ...(finalSession.error.details && { details: finalSession.error.details }),
            }
          } : {}),
          ...(finalSession.result?.stats ? { stats: finalSession.result.stats } : {}),
        };

        // Handle successful completion
        const completedJob: ConversionJob = {
          ...job,
          status: 'completed',
          result,
          endTime: new Date(),
          progress: { ...job.progress, percentage: 100 },
        };

        set(state => ({
          currentJob: null,
          progress: null,
          isProcessing: false,
          jobHistory: [completedJob, ...state.jobHistory],
        }));

        // Update statistics
        get().updateStats(result);

        // Process next in queue if auto-start is enabled
        if (get().autoStartQueue && get().queue.length > 0) {
          setTimeout(() => get().processNextInQueue(), 1000);
        }

        return job.id;
      } catch (error) {
        // Handle error
        const failedJob: ConversionJob = {
          ...job,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date(),
        };

        set(state => ({
          currentJob: null,
          isProcessing: false,
          jobHistory: [failedJob, ...state.jobHistory],
          stats: {
            ...state.stats,
            failedJobs: state.stats.failedJobs + 1,
            successRate: ((state.stats.completedJobs) / (state.stats.totalJobs)) * 100,
          },
        }));

        throw error;
      }
    },

    cancelConversion: async (jobId?: string): Promise<boolean> => {
      const { currentJob, videoProcessor } = get();
      
      if (!currentJob || currentJob.status !== 'processing') {
        return false;
      }

      if (jobId && currentJob.id !== jobId) {
        return false;
      }

      try {
        // Cancel the current conversion
        await videoProcessor.cancelConversion(currentJob.id);

        // Update job status
        const cancelledJob: ConversionJob = {
          ...currentJob,
          status: 'cancelled',
          endTime: new Date(),
        };

        set(state => ({
          currentJob: null,
          isProcessing: false,
          jobHistory: [cancelledJob, ...state.jobHistory],
        }));

        return true;
      } catch (error) {
        console.error('Failed to cancel conversion:', error);
        return false;
      }
    },

    pauseConversion: async (): Promise<boolean> => {
      const { currentJob, videoProcessor } = get();
      
      if (!currentJob || currentJob.status !== 'processing') {
        return false;
      }

      try {
        await videoProcessor.pauseConversion(currentJob.id);
        set({ isPaused: true });
        return true;
      } catch (error) {
        console.error('Failed to pause conversion:', error);
        return false;
      }
    },

    resumeConversion: async (): Promise<boolean> => {
      const { currentJob, videoProcessor } = get();
      
      if (!currentJob || !get().isPaused) {
        return false;
      }

      try {
        await videoProcessor.resumeConversion(currentJob.id);
        set({ isPaused: false });
        return true;
      } catch (error) {
        console.error('Failed to resume conversion:', error);
        return false;
      }
    },

    retryConversion: async (jobId: string): Promise<boolean> => {
      const { jobHistory } = get();
      const job = jobHistory.find(j => j.id === jobId);
      
      if (!job || job.status !== 'failed') {
        return false;
      }

      try {
        await get().startConversion(job.request);
        return true;
      } catch (error) {
        console.error('Failed to retry conversion:', error);
        return false;
      }
    },

    clearJob: (): void => {
      set({ 
        currentJob: null,
        progress: null,
        isProcessing: false,
        isPaused: false
      });
    },

    addToQueue: (item: Omit<QueueItem, 'id' | 'addedAt'>): string => {
      const queueItem: QueueItem = {
        ...item,
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date(),
      };

      set(state => ({
        queue: [...state.queue, queueItem].sort((a, b) => {
          // Sort by priority (higher number = higher priority), then by addedAt
          const priorityDiff = b.priority - a.priority;
          if (priorityDiff !== 0) return priorityDiff;
          return a.addedAt.getTime() - b.addedAt.getTime();
        }),
      }));

      // Auto-start queue if enabled and not currently processing
      if (get().autoStartQueue && !get().isProcessing) {
        setTimeout(() => get().processNextInQueue(), 500);
      }

      return queueItem.id;
    },

    removeFromQueue: (itemId: string): boolean => {
      const { queue } = get();
      const initialLength = queue.length;
      
      set(state => ({
        queue: state.queue.filter(item => item.id !== itemId),
      }));

      return get().queue.length < initialLength;
    },

    clearQueue: (): void => {
      set({ queue: [] });
    },

    reorderQueue: (itemIds: string[]): void => {
      const { queue } = get();
      const reorderedQueue = itemIds
        .map(id => queue.find(item => item.id === id))
        .filter(Boolean) as QueueItem[];
      
      set({ queue: reorderedQueue });
    },

    startQueue: async (): Promise<boolean> => {
      set({ isQueueActive: true });
      return get().processNextInQueue();
    },

    stopQueue: async (): Promise<boolean> => {
      set({ isQueueActive: false });
      return true;
    },

    processNextInQueue: async (): Promise<boolean> => {
      const { queue, isQueueActive, isProcessing } = get();
      
      if (!isQueueActive || isProcessing || queue.length === 0) {
        return false;
      }

      const nextItem = queue[0];
      if (!nextItem) return false;

      // Remove from queue
      get().removeFromQueue(nextItem.id);

      try {
        await get().startConversion(nextItem.request);
        return true;
      } catch (error) {
        console.error('Failed to process queue item:', error);
        return false;
      }
    },

    updateProgress: (jobId: string, progress: Partial<UIConversionProgress>): void => {
      set(state => {
        if (state.currentJob && state.currentJob.id === jobId) {
          const estimatedTime = progress.estimatedTimeRemaining 
            ? new Date(Date.now() + progress.estimatedTimeRemaining)
            : state.currentJob.estimatedCompletionTime;
            
          const updatedJob: ConversionJob = {
            ...state.currentJob,
            status: 'processing',
            progress: { ...state.currentJob.progress, ...progress },
            ...(estimatedTime ? { estimatedCompletionTime: estimatedTime } : {}),
          };
          
          return {
            ...state,
            currentJob: updatedJob,
          };
        }
        return state;
      });
    },

    updateJobStatus: (jobId: string, status: ConversionJob['status'], error?: string): void => {
      set(state => {
        if (state.currentJob && state.currentJob.id === jobId) {
          return {
            currentJob: {
              ...state.currentJob,
              status,
              ...(error && { error }),
              ...((status === 'completed' || status === 'failed' || status === 'cancelled') 
                ? { endTime: new Date() } : {}),
            },
          };
        }
        return state;
      });
    },

    updateStats: (jobResult: ConversionResult): void => {
      set(state => {
        const newStats = { ...state.stats };
        
        if (jobResult.status === ConversionStatus.COMPLETED) {
          newStats.completedJobs += 1;
          
          // Calculate processing time from timestamps
          if (jobResult.endTime && jobResult.startTime) {
            const processingTime = jobResult.endTime.getTime() - jobResult.startTime.getTime();
            newStats.totalProcessingTime += processingTime;
            newStats.averageProcessingTime = newStats.totalProcessingTime / newStats.completedJobs;
          }
          
          // Update size statistics if available from stats
          if (jobResult.stats) {
            newStats.totalSizeProcessed += jobResult.stats.inputSize || 0;
            newStats.totalSizeReduced += (jobResult.stats.inputSize || 0) - (jobResult.stats.outputSize || 0);
          }
        } else {
          newStats.failedJobs += 1;
        }
        
        newStats.successRate = (newStats.completedJobs / newStats.totalJobs) * 100;
        
        return { stats: newStats };
      });
    },

    resetStats: (): void => {
      set({
        stats: {
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          totalProcessingTime: 0,
          averageProcessingTime: 0,
          totalFilesProcessed: 0,
          totalSizeProcessed: 0,
          totalSizeReduced: 0,
          successRate: 0,
        },
      });
    },

    updateSettings: (settings): void => {
      set(state => ({ ...state, ...settings }));
    },

    checkDeviceReadiness: async (): Promise<boolean> => {
      // This would integrate with the device monitor store
      // For now, return true
      return true;
    },

    getJobById: (jobId: string): ConversionJob | null => {
      const { currentJob, jobHistory } = get();
      
      if (currentJob && currentJob.id === jobId) {
        return currentJob;
      }
      
      return jobHistory.find(job => job.id === jobId) || null;
    },

    getQueuePosition: (itemId: string): number => {
      const { queue } = get();
      return queue.findIndex(item => item.id === itemId) + 1; // 1-based position
    },

    estimateQueueTime: (): number => {
      const { queue, stats } = get();
      
      if (queue.length === 0 || stats.averageProcessingTime === 0) {
        return 0;
      }
      
      return queue.length * stats.averageProcessingTime;
    },

    exportJobHistory: (): string => {
      const { jobHistory, stats } = get();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        statistics: stats,
        jobHistory: jobHistory.map(job => ({
          ...job,
          // Exclude large objects from export
          request: {
            ...job.request,
            inputFile: {
              id: job.request.inputFile.id,
              name: job.request.inputFile.name,
              path: job.request.inputFile.path,
              size: job.request.inputFile.size,
              mimeType: job.request.inputFile.mimeType,
              createdAt: job.request.inputFile.createdAt,
              metadata: job.request.inputFile.metadata,
            },
          },
        })),
      };
      
      return JSON.stringify(exportData, null, 2);
    },

    clearHistory: (): void => {
      set({ jobHistory: [] });
    },
  }))
);

/**
 * Selector hooks for specific state slices
 */
export const useConversionProgress = () => 
  useConversionStore(state => ({
    currentJob: state.currentJob,
    isProcessing: state.isProcessing,
    isPaused: state.isPaused,
    progress: state.currentJob?.progress,
  }));

export const useConversionQueue = () =>
  useConversionStore(state => ({
    queue: state.queue,
    isQueueActive: state.isQueueActive,
    addToQueue: state.addToQueue,
    removeFromQueue: state.removeFromQueue,
    clearQueue: state.clearQueue,
    reorderQueue: state.reorderQueue,
    startQueue: state.startQueue,
    stopQueue: state.stopQueue,
  }));

export const useConversionStats = () =>
  useConversionStore(state => ({
    stats: state.stats,
    resetStats: state.resetStats,
    exportJobHistory: state.exportJobHistory,
    clearHistory: state.clearHistory,
  }));

export const useConversionActions = () =>
  useConversionStore(state => ({
    startConversion: state.startConversion,
    cancelConversion: state.cancelConversion,
    pauseConversion: state.pauseConversion,
    resumeConversion: state.resumeConversion,
    retryConversion: state.retryConversion,
  }));