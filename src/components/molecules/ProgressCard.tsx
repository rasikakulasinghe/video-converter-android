import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { ProgressBar } from '../atoms/ProgressBar';
import { Button } from '../atoms/Button';
import { Icon, IconName } from '../atoms/Icon';

/**
 * Progress card status types
 */
export type ProgressCardStatus = 'idle' | 'preparing' | 'converting' | 'completed' | 'error' | 'cancelled';

/**
 * Video file information for progress display
 */
export interface VideoFileInfo {
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** Duration in seconds */
  duration: number;
  /** Video resolution (e.g., "1920x1080") */
  resolution: string;
  /** Input format (e.g., "MOV", "AVI") */
  format: string;
}

/**
 * Conversion progress information
 */
export interface ConversionProgress {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Current processing phase */
  phase: 'analyzing' | 'converting' | 'optimizing' | 'finalizing';
  /** Processing speed (number for multiplier or string for display like "2.5x") */
  speed?: string | number;
  /** Processed frames */
  processedFrames?: number;
  /** Total frames */
  totalFrames?: number;
}

/**
 * Props for the ProgressCard component
 */
export interface ProgressCardProps {
  /** Video file information */
  videoFile: VideoFileInfo;
  /** Current conversion status */
  status: ProgressCardStatus;
  /** Progress information (only when status is 'converting') */
  progress?: ConversionProgress;
  /** Error message (only when status is 'error') */
  errorMessage?: string;
  /** Callback when cancel button is pressed */
  onCancel?: () => void;
  /** Callback when retry button is pressed (on error) */
  onRetry?: () => void;
  /** Callback when view result button is pressed (on completion) */
  onViewResult?: () => void;
  /** Callback when start conversion is pressed (when idle) */
  onStartConversion?: () => void;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Formats file size in human readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Formats duration in human readable format
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time remaining in human readable format
 */
const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${Math.ceil(seconds % 60)}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

/**
 * ProgressCard Component
 * 
 * A molecular component that displays video conversion progress with file information,
 * progress indicators, and action buttons. Composes Text, ProgressBar, Button, and Icon atoms.
 * 
 * @example
 * ```tsx
 * <ProgressCard
 *   videoFile={{
 *     filename: "video.mov",
 *     size: 104857600,
 *     duration: 120,
 *     resolution: "1920x1080",
 *     format: "MOV"
 *   }}
 *   status="converting"
 *   progress={{
 *     percentage: 65,
 *     estimatedTimeRemaining: 45,
 *     phase: "converting",
 *     speed: "2.1x"
 *   }}
 *   onCancel={() => console.log('Cancel')}
 * />
 * ```
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({
  videoFile,
  status,
  progress,
  errorMessage,
  onCancel,
  onRetry,
  onViewResult,
  onStartConversion,
  containerStyle,
  testID = 'progress-card',
  accessibilityLabel,
}) => {
  // Get status-specific colors and icons
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'cancelled': return 'muted';
      case 'converting': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (): IconName => {
    switch (status) {
      case 'completed': return 'check';
      case 'error': return 'error';
      case 'cancelled': return 'stop';
      case 'converting': return 'play';
      case 'preparing': return 'refresh';
      default: return 'file';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Ready to convert';
      case 'preparing': return 'Preparing conversion...';
      case 'converting': return progress ? `Converting - ${progress.phase}` : 'Converting...';
      case 'completed': return 'Conversion completed';
      case 'error': return 'Conversion failed';
      case 'cancelled': return 'Conversion cancelled';
      default: return 'Unknown status';
    }
  };

  const getProgressVariant = () => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const shouldShowProgress = status === 'converting' || status === 'preparing' || status === 'completed';
  const progressValue = status === 'completed' ? 100 : (progress?.percentage || 0);
  const isIndeterminate = status === 'preparing';

  return (
    <View 
      style={[
        {
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        containerStyle
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `Video conversion progress for ${videoFile.filename}`}
      accessibilityRole="progressbar"
    >
      {/* Header with file info and status icon */}
      <View 
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text 
            variant="subheading" 
            weight="semibold" 
            numberOfLines={1}
            testID={`${testID}-filename`}
          >
            {videoFile.filename}
          </Text>
          <View 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text variant="caption" color="muted" testID={`${testID}-file-size`}>
              {formatFileSize(videoFile.size)}
            </Text>
            <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>
              •
            </Text>
            <Text variant="caption" color="muted" testID={`${testID}-duration`}>
              {formatDuration(videoFile.duration)}
            </Text>
            <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>
              •
            </Text>
            <Text variant="caption" color="muted" testID={`${testID}-resolution`}>
              {videoFile.resolution}
            </Text>
          </View>
        </View>
        
        <Icon 
          name={getStatusIcon()} 
          size="md" 
          color={getStatusColor()}
          testID={`${testID}-status-icon`}
        />
      </View>

      {/* Status text */}
      <Text 
        variant="body" 
        color={getStatusColor()}
        weight="medium"
        style={{ marginBottom: 12 }}
        testID={`${testID}-status-text`}
      >
        {getStatusText()}
      </Text>

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <View 
          style={{
            backgroundColor: '#fef2f2',
            borderWidth: 1,
            borderColor: '#fecaca',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text variant="body-small" color="error" testID={`${testID}-error-message`}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Progress bar */}
      {shouldShowProgress && (
        <View style={{ marginBottom: 16 }}>
          <ProgressBar
            value={progressValue}
            variant={getProgressVariant()}
            size="md"
            animated={true}
            indeterminate={isIndeterminate}
            showText={false}
            testID={`${testID}-progress-bar`}
          />
          
          {/* Progress details */}
          {status === 'converting' && progress && (
            <View 
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text variant="caption" color="muted" testID={`${testID}-progress-percentage`}>
                {`${Math.round(progress.percentage)}% complete`}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {progress.speed != null && (
                  <>
                    <Text variant="caption" color="muted" testID={`${testID}-speed`}>
                      {typeof progress.speed === 'number' ? `${progress.speed.toFixed(1)}x` : progress.speed}
                    </Text>
                    <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>
                      •
                    </Text>
                  </>
                )}
                
                {progress.estimatedTimeRemaining && (
                  <Text variant="caption" color="muted" testID={`${testID}-time-remaining`}>
                    {`${formatTimeRemaining(progress.estimatedTimeRemaining)} remaining`}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Frame progress (if available) */}
          {status === 'converting' && progress?.processedFrames && progress?.totalFrames && (
            <Text 
              variant="caption" 
              color="muted" 
              style={{ marginTop: 4 }}
              testID={`${testID}-frame-progress`}
            >
              {`Frame ${progress.processedFrames.toLocaleString()} of ${progress.totalFrames.toLocaleString()}`}
            </Text>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        {/* Cancel button (shown during conversion) */}
        {(status === 'converting' || status === 'preparing') && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onPress={onCancel}
            testID={`${testID}-cancel-button`}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </Button>
        )}

        {/* Retry button (shown on error) */}
        {status === 'error' && onRetry && (
          <Button
            variant="primary"
            size="sm"
            onPress={onRetry}
            testID={`${testID}-retry-button`}
            style={{ marginLeft: 8 }}
          >
            Retry
          </Button>
        )}

        {/* View result button (shown on completion) */}
        {status === 'completed' && onViewResult && (
          <Button
            variant="primary"
            size="sm"
            onPress={onViewResult}
            testID={`${testID}-view-result-button`}
            style={{ marginLeft: 8 }}
          >
            View Result
          </Button>
        )}

        {/* Start conversion button (shown when idle) */}
        {status === 'idle' && onStartConversion && (
          <Button
            variant="primary"
            size="md"
            onPress={onStartConversion}
            testID={`${testID}-start-button`}
            style={{ marginLeft: 8 }}
          >
            Start Conversion
          </Button>
        )}
      </View>
    </View>
  );
};