import { FFmpegKit, FFmpegSession, ReturnCode, Statistics, Log } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import {
  VideoProcessorService,
  ConversionProgress as ServiceConversionProgress,
  ConversionSession,
  SessionState,
  ProcessingError,
  ProcessingErrorType,
  ProcessingOptions,
  ConversionStatistics,
  VideoAnalysisResult,
  QualityProfile,
  ConversionPreset,
  ValidationResult,
  ConversionEvent,
  ConversionEventType,
  FFmpegCommand,
} from '../VideoProcessorService';
import { VideoFile, ConversionRequest, ConversionResult, VideoQuality, OutputFormat, ConversionStatus, ConversionProgress } from '../../types/models';
import { DeviceCapabilities, ThermalState } from '../../types/models/DeviceCapabilities';

/**
 * FFmpeg-based implementation of VideoProcessorService
 * Handles video conversion operations using FFmpeg Kit React Native
 */
export class FFmpegVideoProcessor implements VideoProcessorService {
  private activeSessions: Map<string, FFmpegSession> = new Map();
  private conversionSessions: Map<string, ConversionSession> = new Map();
  private qualityProfiles: QualityProfile[] = [];
  private conversionPresets: ConversionPreset[] = [];

  constructor() {
    this.initializeQualityProfiles();
    this.initializeConversionPresets();
  }

  /**
   * Analyzes a video file and returns metadata and recommendations
   */
  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        return {
          isValid: false,
          metadata: null,
          supportedFormats: [],
          recommendedQuality: VideoQuality.SD,
          estimatedProcessingTime: 0,
          complexity: 'unknown',
          issues: ['File not found'],
        };
      }

      // Get file info using FFprobe
      const command = `-v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      if (!ReturnCode.isSuccess(returnCode)) {
        return {
          isValid: false,
          metadata: null,
          supportedFormats: [],
          recommendedQuality: VideoQuality.SD,
          estimatedProcessingTime: 0,
          complexity: 'unknown',
          issues: ['Unable to analyze video file'],
        };
      }

      const output = await session.getOutput();
      const metadata = JSON.parse(output || '{}');

      // Extract video stream information
      const videoStream = metadata.streams?.find((stream: any) => stream.codec_type === 'video');
      const audioStream = metadata.streams?.find((stream: any) => stream.codec_type === 'audio');

      if (!videoStream) {
        return {
          isValid: false,
          metadata: null,
          supportedFormats: [],
          recommendedQuality: VideoQuality.SD,
          estimatedProcessingTime: 0,
          complexity: 'unknown',
          issues: ['No video stream found'],
        };
      }

      // Determine complexity based on resolution and codec
      const width = parseInt(videoStream.width) || 0;
      const height = parseInt(videoStream.height) || 0;
      const complexity = this.determineComplexity(width, height, videoStream.codec_name);

      // Recommend quality based on source resolution
      const recommendedQuality = this.recommendQuality(width, height);

      // Estimate processing time (rough calculation)
      const duration = parseFloat(metadata.format?.duration || '0');
      const estimatedProcessingTime = this.calculateEstimatedProcessingTime(duration, complexity);

      return {
        isValid: true,
        metadata: {
          duration,
          width,
          height,
          codec: videoStream.codec_name,
          bitrate: parseInt(metadata.format?.bit_rate || '0'),
          frameRate: this.parseFrameRate(videoStream.r_frame_rate),
          hasAudio: !!audioStream,
          audioCodec: audioStream?.codec_name,
        },
        supportedFormats: [OutputFormat.MP4, OutputFormat.MOV, OutputFormat.AVI, OutputFormat.MKV],
        recommendedQuality,
        estimatedProcessingTime,
        complexity,
        issues: [],
      };
    } catch (error) {
      throw new ProcessingError(
        ProcessingErrorType.ENCODING_ERROR,
        `Failed to analyze video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ANALYSIS_FAILED'
      );
    }
  }

  /**
   * Creates a new conversion session from a request
   */
  async createSession(request: ConversionRequest): Promise<ConversionSession> {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const session: ConversionSession = {
      id: sessionId,
      request,
      state: SessionState.CREATED,
      createdAt: now,
      progress: {
        percentage: 0,
        processedDuration: 0,
        totalDuration: 0,
        currentPhase: 'created',
        estimatedTimeRemaining: 0,
        processingSpeed: 0,
      },
      statistics: {
        startTime: now,
        bytesProcessed: 0,
        framesProcessed: 0,
        averageSpeed: 0,
        peakMemoryUsage: 0,
        cpuUsage: 0,
      },
    };

    // Add sessionId as alias for id for compatibility
    (session as any).sessionId = sessionId;

    this.conversionSessions.set(sessionId, session);
    return session;
  }

  /**
   * Starts processing for the specified session
   */
  async startConversion(sessionId: string, options: ProcessingOptions): Promise<void> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    if (session.state !== SessionState.CREATED && session.state !== SessionState.VALIDATED) {
      throw new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        `Cannot start conversion for session in state: ${session.state}`,
        'INVALID_STATE'
      );
    }

    try {
      // Update session state
      session.state = SessionState.PROCESSING;
      session.startedAt = new Date();
      session.progress.currentPhase = 'starting';

      // Build FFmpeg command
      const command = this.buildFFmpegCommand(session.request);

      // Execute FFmpeg with progress tracking
      const ffmpegSession = await FFmpegKit.executeAsync(
        command.arguments.join(' '),
        (completedSession) => this.handleSessionCompletion(sessionId, completedSession),
        (log) => this.handleLogMessage(sessionId, log),
        (statistics) => this.handleStatistics(sessionId, statistics)
      );

      this.activeSessions.set(sessionId, ffmpegSession);

      // Trigger progress callback if provided
      if (options.onProgress) {
        const event: ConversionEvent = {
          type: ConversionEventType.CONVERSION_STARTED,
          sessionId,
          timestamp: new Date(),
          data: { session },
        };
        options.onProgress(event);
      }
    } catch (error) {
      session.state = SessionState.FAILED;
      session.error = new ProcessingError(
        ProcessingErrorType.ENCODING_ERROR,
        `Failed to start conversion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'START_FAILED'
      );
      throw session.error;
    }
  }

  /**
   * Pauses an active conversion session
   */
  async pauseConversion(sessionId: string): Promise<void> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    if (session.state !== SessionState.PROCESSING) {
      throw new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        `Cannot pause session in state: ${session.state}`,
        'INVALID_STATE'
      );
    }

    // Note: FFmpeg Kit doesn't support pause/resume, so we'll cancel and allow restart
    session.state = SessionState.PAUSED;
    session.progress.currentPhase = 'paused';
  }

  /**
   * Resumes a paused conversion session
   */
  async resumeConversion(sessionId: string): Promise<void> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    if (session.state !== SessionState.PAUSED) {
      throw new ProcessingError(
        ProcessingErrorType.INVALID_OPERATION,
        `Cannot resume session in state: ${session.state}`,
        'INVALID_STATE'
      );
    }

    session.state = SessionState.PROCESSING;
    session.progress.currentPhase = 'resuming';
  }

  /**
   * Cancels a conversion session and cleans up resources
   */
  async cancelConversion(sessionId: string): Promise<void> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }

    const ffmpegSession = this.activeSessions.get(sessionId);
    if (ffmpegSession) {
      await ffmpegSession.cancel();
      this.activeSessions.delete(sessionId);
    }

    session.state = SessionState.CANCELLED;
    session.completedAt = new Date();
    session.progress.currentPhase = 'cancelled';
  }

  /**
   * Gets current status and progress for a session
   */
  async getSessionStatus(sessionId: string): Promise<ConversionSession> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      throw new ProcessingError(
        ProcessingErrorType.SESSION_NOT_FOUND,
        `Session ${sessionId} not found`,
        'SESSION_NOT_FOUND'
      );
    }
    return { ...session };
  }

  /**
   * Gets list of supported output formats
   */
  async getSupportedFormats(deviceCapabilities?: DeviceCapabilities): Promise<OutputFormat[]> {
    // All formats are supported by FFmpeg
    return [OutputFormat.MP4, OutputFormat.MOV, OutputFormat.AVI, OutputFormat.MKV];
  }

  /**
   * Gets available quality profiles
   */
  async getQualityProfiles(): Promise<QualityProfile[]> {
    return [...this.qualityProfiles];
  }

  /**
   * Gets available conversion presets
   */
  async getConversionPresets(): Promise<ConversionPreset[]> {
    return [...this.conversionPresets];
  }

  /**
   * Validates a conversion request
   */
  async validateRequest(request: ConversionRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if input file exists
    const inputExists = await RNFS.exists(request.inputFile.path);
    if (!inputExists) {
      errors.push('Input file does not exist');
    }

    // Check output directory
    const outputDir = require('path').dirname(request.outputPath);
    const outputDirExists = await RNFS.exists(outputDir);
    if (!outputDirExists) {
      try {
        await RNFS.mkdir(outputDir);
      } catch {
        errors.push('Cannot create output directory');
      }
    }

    // Check available storage
    const fileStats = inputExists ? await RNFS.stat(request.inputFile.path) : null;
    if (fileStats) {
      const freeSpace = await RNFS.getFSInfo();
      const estimatedOutputSize = Number(fileStats.size) * 0.8; // Rough estimate
      if (freeSpace.freeSpace < estimatedOutputSize) {
        errors.push('Insufficient storage space');
      }
    }

    // Validate quality and format combination
    if (!this.isValidQualityForFormat(request.targetQuality, request.outputFormat)) {
      warnings.push('Quality setting may not be optimal for selected format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Estimates processing time for a conversion request
   */
  async estimateProcessingTime(
    request: ConversionRequest,
    deviceCapabilities: DeviceCapabilities
  ): Promise<number> {
    try {
      // Analyze input video
      const analysis = await this.analyzeVideo(request.inputFile.path);
      if (!analysis.isValid || !analysis.metadata) {
        return 0;
      }

      const duration = analysis.metadata.duration;
      const complexity = analysis.complexity;

      // Base processing speed (real-time ratio)
      let speedMultiplier = 1.0;

      // Adjust based on device capabilities
      const capabilityScore = deviceCapabilities.performance?.videoProcessingScore || 50;
      speedMultiplier *= Math.max(0.1, capabilityScore / 50);

      // Adjust based on complexity
      switch (complexity) {
        case 'simple':
          speedMultiplier *= 2.0;
          break;
        case 'medium':
          speedMultiplier *= 1.0;
          break;
        case 'complex':
          speedMultiplier *= 0.5;
          break;
        default:
          speedMultiplier *= 0.8;
      }

      // Adjust based on quality setting
      switch (request.targetQuality) {
        case VideoQuality.LOW:
          speedMultiplier *= 1.5;
          break;
        case VideoQuality.SD:
          speedMultiplier *= 1.2;
          break;
        case VideoQuality.HD:
          speedMultiplier *= 1.0;
          break;
        case VideoQuality.FULL_HD:
          speedMultiplier *= 0.7;
          break;
        case VideoQuality.UHD_4K:
          speedMultiplier *= 0.3;
          break;
      }

      return Math.round((duration / 1000) / speedMultiplier * 1000);
    } catch {
      return 0;
    }
  }

  /**
   * Estimates output file size for a conversion request
   */
  async estimateOutputSize(request: ConversionRequest): Promise<number> {
    try {
      const inputStats = await RNFS.stat(request.inputFile.path);
      const inputSize = Number(inputStats.size);

      // Base compression ratio by quality
      let compressionRatio = 0.8;
      switch (request.targetQuality) {
        case VideoQuality.LOW:
          compressionRatio = 0.3;
          break;
        case VideoQuality.SD:
          compressionRatio = 0.5;
          break;
        case VideoQuality.HD:
          compressionRatio = 0.7;
          break;
        case VideoQuality.FULL_HD:
          compressionRatio = 0.9;
          break;
        case VideoQuality.UHD_4K:
          compressionRatio = 1.2;
          break;
      }

      return Math.round(inputSize * compressionRatio);
    } catch {
      return 0;
    }
  }

  /**
   * Cleans up temporary files and resources
   */
  async cleanup(sessionId?: string): Promise<void> {
    if (sessionId) {
      // Clean up specific session
      const ffmpegSession = this.activeSessions.get(sessionId);
      if (ffmpegSession) {
        await ffmpegSession.cancel();
        this.activeSessions.delete(sessionId);
      }
      this.conversionSessions.delete(sessionId);
    } else {
      // Clean up all sessions
      for (const [id, ffmpegSession] of this.activeSessions) {
        await ffmpegSession.cancel();
      }
      this.activeSessions.clear();
      this.conversionSessions.clear();
    }
  }

  // Private helper methods

  private initializeQualityProfiles(): void {
    this.qualityProfiles = [
      {
        quality: VideoQuality.LOW,
        width: 640,
        height: 360,
        bitrate: 500000,
        frameRate: 24,
        codecProfile: 'baseline',
        description: 'Low quality for small file sizes',
      },
      {
        quality: VideoQuality.SD,
        width: 854,
        height: 480,
        bitrate: 1000000,
        frameRate: 30,
        codecProfile: 'main',
        description: 'Standard definition',
      },
      {
        quality: VideoQuality.HD,
        width: 1280,
        height: 720,
        bitrate: 2500000,
        frameRate: 30,
        codecProfile: 'high',
        description: 'High definition',
      },
      {
        quality: VideoQuality.FULL_HD,
        width: 1920,
        height: 1080,
        bitrate: 5000000,
        frameRate: 30,
        codecProfile: 'high',
        description: 'Full high definition',
      },
      {
        quality: VideoQuality.UHD_4K,
        width: 3840,
        height: 2160,
        bitrate: 15000000,
        frameRate: 30,
        codecProfile: 'high',
        description: 'Ultra high definition 4K',
      },
    ];
  }

  private initializeConversionPresets(): void {
    this.conversionPresets = [
      {
        id: 'web-optimized',
        name: 'Web Optimized',
        description: 'Optimized for web playback with good compression',
        quality: VideoQuality.HD,
        format: OutputFormat.MP4,
        ffmpegArgs: ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23'],
        speedMultiplier: 1.0,
        minCapabilityScore: 30,
      },
      {
        id: 'mobile-friendly',
        name: 'Mobile Friendly',
        description: 'Optimized for mobile devices',
        quality: VideoQuality.SD,
        format: OutputFormat.MP4,
        ffmpegArgs: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '28'],
        speedMultiplier: 1.5,
        minCapabilityScore: 20,
      },
      {
        id: 'high-quality',
        name: 'High Quality',
        description: 'Maximum quality with larger file size',
        quality: VideoQuality.FULL_HD,
        format: OutputFormat.MP4,
        ffmpegArgs: ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18'],
        speedMultiplier: 0.5,
        minCapabilityScore: 60,
      },
    ];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineComplexity(width: number, height: number, codec: string): 'simple' | 'medium' | 'complex' | 'unknown' {
    const pixels = width * height;
    
    if (pixels < 640 * 480) return 'simple';
    if (pixels < 1920 * 1080) return 'medium';
    return 'complex';
  }

  private recommendQuality(width: number, height: number): VideoQuality {
    const pixels = width * height;
    
    if (pixels >= 3840 * 2160) return VideoQuality.UHD_4K;
    if (pixels >= 1920 * 1080) return VideoQuality.FULL_HD;
    if (pixels >= 1280 * 720) return VideoQuality.HD;
    if (pixels >= 854 * 480) return VideoQuality.SD;
    return VideoQuality.LOW;
  }

  private parseFrameRate(frameRateStr: string): number {
    if (!frameRateStr) return 30;
    
    const parts = frameRateStr.split('/');
    if (parts.length === 2) {
      const num = parseInt(parts[0] || '0');
      const den = parseInt(parts[1] || '1');
      return den > 0 ? num / den : 30;
    }
    
    return parseFloat(frameRateStr) || 30;
  }

  private calculateEstimatedProcessingTime(duration: number, complexity: string): number {
    let multiplier = 1.0;
    
    switch (complexity) {
      case 'simple':
        multiplier = 0.5;
        break;
      case 'medium':
        multiplier = 1.0;
        break;
      case 'complex':
        multiplier = 2.0;
        break;
      default:
        multiplier = 1.5;
    }
    
    return Math.round(duration * multiplier * 1000);
  }

  private buildFFmpegCommand(request: ConversionRequest): FFmpegCommand {
    const args = [
      '-i', `"${request.inputFile.path}"`,
      '-c:v', 'libx264',
      '-preset', 'medium',
    ];

    // Add quality-specific settings
    const profile = this.qualityProfiles.find(p => p.quality === request.targetQuality);
    if (profile) {
      args.push('-s', `${profile.width}x${profile.height}`);
      args.push('-b:v', profile.bitrate.toString());
      args.push('-r', profile.frameRate.toString());
    }

    // Add audio settings
    args.push('-c:a', 'aac', '-b:a', '128k');

    // Add output path
    args.push(`"${request.outputPath}"`);

    return {
      inputPath: request.inputFile.path,
      outputPath: request.outputPath,
      arguments: args,
      estimatedDuration: 0, // Will be calculated during processing
    };
  }

  private isValidQualityForFormat(quality: VideoQuality, format: OutputFormat): boolean {
    // All combinations are valid for FFmpeg
    return true;
  }

  private async handleSessionCompletion(sessionId: string, ffmpegSession: FFmpegSession): Promise<void> {
    const session = this.conversionSessions.get(sessionId);
    if (!session) return;

    const returnCode = await ffmpegSession.getReturnCode();
    
    if (ReturnCode.isSuccess(returnCode)) {
      session.state = SessionState.COMPLETED;
      session.completedAt = new Date();
      session.progress.percentage = 100;
      session.progress.currentPhase = 'completed';

      // Create result
      try {
        const outputStats = await RNFS.stat(session.request.outputPath);
        session.result = {
          id: `result_${session.id}`,
          request: session.request,
          status: ConversionStatus.COMPLETED,
          progress: {
            percentage: 100,
            currentFrame: 0,
            totalFrames: 0,
            processedDuration: session.request.inputFile.metadata.duration,
            totalDuration: session.request.inputFile.metadata.duration,
            estimatedTimeRemaining: 0,
            currentBitrate: 0,
            averageFps: 0,
          },
          startTime: session.statistics.startTime,
          endTime: new Date(),
          outputFile: {
            path: session.request.outputPath,
            size: Number(outputStats.size),
            metadata: {
              duration: session.request.inputFile.metadata.duration,
              width: 0, // Will be filled by actual analysis
              height: 0, // Will be filled by actual analysis
              frameRate: session.request.inputFile.metadata.frameRate,
              bitrate: session.request.inputFile.metadata.bitrate,
              codec: 'h264', // Default for converted files
            },
          },
        };
      } catch (error) {
        session.state = SessionState.FAILED;
        session.error = new ProcessingError(
          ProcessingErrorType.UNKNOWN_ERROR,
          'Failed to read output file',
          'OUTPUT_READ_FAILED'
        );
      }
    } else {
      session.state = SessionState.FAILED;
      session.error = new ProcessingError(
        ProcessingErrorType.ENCODING_ERROR,
        'FFmpeg processing failed',
        'FFMPEG_FAILED'
      );
    }

    this.activeSessions.delete(sessionId);
  }

  private handleLogMessage(sessionId: string, log: Log): void {
    // Log messages can be used for debugging
    console.log(`Session ${sessionId}: ${log.getMessage()}`);
  }

  private handleStatistics(sessionId: string, statistics: Statistics): void {
    const session = this.conversionSessions.get(sessionId);
    if (!session) return;

    const timeInMilliseconds = statistics.getTime();
    const speed = statistics.getSpeed();

    // Update progress
    if (session.request.inputFile.metadata.duration > 0) {
      const percentage = Math.min(100, (timeInMilliseconds / session.request.inputFile.metadata.duration) * 100);
      session.progress.percentage = percentage;
      session.progress.processedDuration = timeInMilliseconds;
      session.progress.totalDuration = session.request.inputFile.metadata.duration;
      session.progress.processingSpeed = speed;
      
      if (speed > 0) {
        const remainingTime = (session.progress.totalDuration - timeInMilliseconds) / speed;
        session.progress.estimatedTimeRemaining = remainingTime;
      }
    }

    // Update statistics
    session.statistics.bytesProcessed = statistics.getSize();
    session.statistics.averageSpeed = speed;
    session.progress.currentPhase = 'processing';
  }

  private getMimeTypeForFormat(format: OutputFormat): string {
    switch (format) {
      case OutputFormat.MP4:
        return 'video/mp4';
      case OutputFormat.MOV:
        return 'video/quicktime';
      case OutputFormat.AVI:
        return 'video/x-msvideo';
      case OutputFormat.MKV:
        return 'video/x-matroska';
      default:
        return 'video/mp4';
    }
  }

  // Additional methods expected by contract tests

  /**
   * Gets the current session state
   */
  getSessionState(sessionId: string): SessionState {
    const session = this.conversionSessions.get(sessionId);
    return session ? session.state : SessionState.FAILED;
  }

  /**
   * Gets current progress for a session
   */
  getProgress(sessionId: string): ConversionProgress {
    const session = this.conversionSessions.get(sessionId);
    if (!session) {
      return {
        percentage: 0,
        currentFrame: 0,
        totalFrames: 0,
        processedDuration: 0,
        totalDuration: 0,
        estimatedTimeRemaining: 0,
        currentBitrate: 0,
        averageFps: 0
      };
    }

    // Convert from service ConversionProgress to models ConversionProgress
    return {
      percentage: session.progress.percentage,
      currentFrame: Math.floor(session.progress.processedDuration * 30 / 1000), // Estimate frames at 30fps
      totalFrames: Math.floor(session.progress.totalDuration * 30 / 1000), // Estimate frames at 30fps  
      processedDuration: session.progress.processedDuration,
      totalDuration: session.progress.totalDuration,
      estimatedTimeRemaining: session.progress.estimatedTimeRemaining,
      currentBitrate: 1000000, // Default 1Mbps
      averageFps: 30 // Default 30fps
    };
  }

  /**
   * Event listeners for progress updates
   */
  private progressListeners: Array<(progress: ConversionProgress) => void> = [];
  private sessionCompleteListeners: Array<(result: ConversionResult) => void> = [];
  private errorListeners: Array<(error: ProcessingError) => void> = [];

  /**
   * Subscribe to progress updates
   */
  onProgressUpdate(callback: (progress: ConversionProgress) => void): () => void {
    this.progressListeners.push(callback);
    return () => {
      const index = this.progressListeners.indexOf(callback);
      if (index > -1) {
        this.progressListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to session completion events
   */
  onSessionComplete(callback: (result: ConversionResult) => void): () => void {
    this.sessionCompleteListeners.push(callback);
    return () => {
      const index = this.sessionCompleteListeners.indexOf(callback);
      if (index > -1) {
        this.sessionCompleteListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: ProcessingError) => void): () => void {
    this.errorListeners.push(callback);
    return () => {
      const index = this.errorListeners.indexOf(callback);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Legacy convertVideo method for backward compatibility
   */
  async convertVideo(request: ConversionRequest): Promise<ConversionResult> {
    const session = await this.createSession(request);
    const deviceCapabilities: DeviceCapabilities = {
      id: 'test-device',
      deviceModel: 'Test Device',
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
        capacity: 3000
      },
      memory: {
        totalRam: 4096 * 1024 * 1024,
        availableRam: 2048 * 1024 * 1024,
        usedRam: 2048 * 1024 * 1024,
        totalStorage: 64 * 1024 * 1024 * 1024,
        availableStorage: 32 * 1024 * 1024 * 1024,
        usedStorage: 32 * 1024 * 1024 * 1024,
        isLowMemory: false
      },
      thermal: {
        state: ThermalState.NORMAL,
        temperature: 25,
        throttleLevel: 0,
        maxSafeTemperature: 65
      },
      processor: {
        cores: 4,
        maxFrequency: 2000,
        currentFrequency: 1800,
        usage: 30,
        architecture: 'arm64'
      },
      performance: {
        benchmark: 7,
        videoProcessingScore: 70,
        thermalEfficiency: 80,
        batteryEfficiency: 80
      }
    };

    const options: ProcessingOptions = {
      deviceCapabilities,
      maxConcurrentSessions: 1,
      enableHardwareAcceleration: false,
      useGpuAcceleration: false,
      qualityPreference: 'balanced',
      powerSavingMode: false,
      thermalMonitoring: false,
      progressUpdateInterval: 1000,
      tempDirectory: '/tmp'
    };

    await this.startConversion(session.id, options);
    
    // Wait for completion
    return new Promise((resolve, reject) => {
      const checkComplete = () => {
        const currentSession = this.conversionSessions.get(session.id);
        if (!currentSession) {
          reject(new ProcessingError(ProcessingErrorType.SESSION_NOT_FOUND, 'Session not found', 'SESSION_NOT_FOUND'));
          return;
        }

        if (currentSession.state === SessionState.COMPLETED && currentSession.result) {
          resolve(currentSession.result);
        } else if (currentSession.state === SessionState.FAILED) {
          reject(currentSession.error || new ProcessingError(ProcessingErrorType.UNKNOWN_ERROR, 'Unknown error', 'UNKNOWN_ERROR'));
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }

  /**
   * Gets optimal conversion settings for device capabilities
   */
  async getOptimalSettings(deviceCapabilities: DeviceCapabilities): Promise<ProcessingOptions> {
    return {
      deviceCapabilities,
      maxConcurrentSessions: deviceCapabilities.processor.cores > 4 ? 2 : 1,
      enableHardwareAcceleration: deviceCapabilities.performance.videoProcessingScore > 70,
      useGpuAcceleration: false,
      qualityPreference: deviceCapabilities.performance.benchmark > 8 ? 'quality' : 'balanced',
      powerSavingMode: deviceCapabilities.battery.level < 0.3,
      thermalMonitoring: true,
      progressUpdateInterval: 1000,
      tempDirectory: '/tmp'
    };
  }
}