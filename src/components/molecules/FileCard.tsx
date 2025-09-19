import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { VideoFile } from '../../types/models';

/**
 * File selection state types
 */
export type FileCardState = 'normal' | 'selected' | 'disabled' | 'processing';

/**
 * Props for the FileCard component
 */
export interface FileCardProps {
  /** Video file */
  file: VideoFile;
  /** Current file state */
  state: FileCardState;
  /** Whether the card shows detailed metadata */
  showDetails?: boolean;
  /** Whether the card is selectable */
  selectable?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Custom thumbnail URI (optional) */
  thumbnailUri?: string;
  /** Callback when card is pressed/selected */
  onPress?: () => void;
  /** Callback when remove button is pressed */
  onRemove?: () => void;
  /** Callback when info button is pressed */
  onInfo?: () => void;
  /** Callback when preview button is pressed */
  onPreview?: () => void;
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
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
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
 * Formats bitrate in human readable format
 */
const formatBitrate = (kbps: number): string => {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} kbps`;
};

/**
 * Formats creation date in readable format
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * FileCard Component
 * 
 * A molecular component that displays video file information with metadata,
 * thumbnail, and action buttons. Composes Text, Icon, and Button atoms.
 * 
 * @example
 * ```tsx
 * <FileCard
 *   file={{
 *     filename: "video.mov",
 *     size: 104857600,
 *     duration: 120,
 *     resolution: "1920x1080",
 *     codec: "H.264",
 *     bitrate: 8000,
 *     framerate: 30,
 *     format: "MOV",
 *     path: "/storage/video.mov",
 *     createdAt: new Date(),
 *     hasAudio: true,
 *     audioCodec: "AAC"
 *   }}
 *   state="normal"
 *   showDetails={true}
 *   onPress={() => console.log('File selected')}
 * />
 * ```
 */
export const FileCard: React.FC<FileCardProps> = ({
  file,
  state,
  showDetails = false,
  selectable = true,
  showActions = true,
  thumbnailUri,
  onPress,
  onRemove,
  onInfo,
  onPreview,
  containerStyle,
  testID = 'file-card',
  accessibilityLabel,
}) => {
  // Get state-specific styling
  const getStateStyles = () => {
    const baseStyle = {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'transparent',
    };

    switch (state) {
      case 'selected':
        return {
          ...baseStyle,
          borderColor: '#2f6690',
          backgroundColor: '#f0f8ff',
        };
      case 'disabled':
        return {
          ...baseStyle,
          opacity: 0.6,
          backgroundColor: '#f5f5f5',
        };
      case 'processing':
        return {
          ...baseStyle,
          borderColor: '#3a7ca5',
          backgroundColor: '#f8fbfc',
        };
      default:
        return baseStyle;
    }
  };

  const getFileIcon = (): IconName => {
    // Extract format from mimeType (e.g., 'video/mp4' -> 'MP4')
    const format = file.mimeType.split('/')[1]?.toUpperCase() || 'VIDEO';
    switch (format) {
      case 'MP4':
      case 'MOV':
      case 'AVI':
      case 'MKV':
      case 'WMV':
        return 'video';
      default:
        return 'file';
    }
  };

  const isInteractive = state !== 'disabled' && state !== 'processing' && selectable;

  const renderThumbnail = () => (
    <View
      style={{
        width: 60,
        height: 60,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}
    >
      {thumbnailUri ? (
        // In a real implementation, you'd use Image component here
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
            backgroundColor: '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text variant="caption" color="muted">IMG</Text>
        </View>
      ) : (
        <Icon 
          name={getFileIcon()} 
          size="lg" 
          color="muted"
          testID={`${testID}-file-icon`}
        />
      )}
    </View>
  );

  const renderMainInfo = () => (
    <View style={{ flex: 1 }}>
      <Text 
        variant="subheading" 
        weight="semibold" 
        numberOfLines={1}
        testID={`${testID}-filename`}
      >
        {file.name}
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text variant="caption" color="muted" testID={`${testID}-size`}>
          {formatFileSize(file.size)}
        </Text>
        <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>•</Text>
        <Text variant="caption" color="muted" testID={`${testID}-duration`}>
          {formatDuration(file.metadata.duration)}
        </Text>
        <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>•</Text>
        <Text variant="caption" color="muted" testID={`${testID}-format`}>
          {file.mimeType.split('/')[1]?.toUpperCase() || 'VIDEO'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
        <Text variant="caption" color="muted" testID={`${testID}-resolution`}>
          {`${file.metadata.width}x${file.metadata.height}`}
        </Text>
        <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>•</Text>
        <Text variant="caption" color="muted" testID={`${testID}-codec`}>
          {file.metadata.codec}
        </Text>
        {file.metadata.audioCodec && (
          <>
            <Text variant="caption" color="muted" style={{ marginHorizontal: 8 }}>•</Text>
            <Icon name="check" size="sm" color="success" />
            <Text variant="caption" color="success" style={{ marginLeft: 2 }}>Audio</Text>
          </>
        )}
      </View>
    </View>
  );

  const renderStateIndicator = () => {
    if (state === 'selected') {
      return (
        <Icon 
          name="check" 
          size="md" 
          color="primary"
          testID={`${testID}-selected-icon`}
        />
      );
    }
    
    if (state === 'processing') {
      return (
        <Icon 
          name="refresh" 
          size="md" 
          color="primary"
          testID={`${testID}-processing-icon`}
        />
      );
    }

    return null;
  };

  const renderDetails = () => {
    if (!showDetails) return null;

    return (
      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ minWidth: 120 }}>
            <Text variant="caption" color="muted">Bitrate</Text>
            <Text variant="body-small" testID={`${testID}-bitrate`}>
              {formatBitrate(file.metadata.bitrate)}
            </Text>
          </View>
          
          <View style={{ minWidth: 80 }}>
            <Text variant="caption" color="muted">FPS</Text>
            <Text variant="body-small" testID={`${testID}-framerate`}>
              {file.metadata.frameRate}
            </Text>
          </View>
          
          <View style={{ minWidth: 120 }}>
            <Text variant="caption" color="muted">Created</Text>
            <Text variant="body-small" testID={`${testID}-created`}>
              {formatDate(file.createdAt)}
            </Text>
          </View>

          {file.metadata.audioCodec && (
            <View style={{ minWidth: 80 }}>
              <Text variant="caption" color="muted">Audio</Text>
              <Text variant="body-small" testID={`${testID}-audio-codec`}>
                {file.metadata.audioCodec}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View
        style={{
          marginTop: 12,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        {onInfo && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon name="info" size="sm" />}
            onPress={onInfo}
            disabled={state === 'disabled'}
            testID={`${testID}-info-button`}
          >
            Info
          </Button>
        )}
        
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="play" size="sm" />}
            onPress={onPreview}
            disabled={state === 'disabled'}
            testID={`${testID}-preview-button`}
          >
            Preview
          </Button>
        )}
        
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon name="close" size="sm" />}
            onPress={onRemove}
            disabled={state === 'disabled' || state === 'processing'}
            testID={`${testID}-remove-button`}
          >
            Remove
          </Button>
        )}
      </View>
    );
  };

  const cardContent = (
    <View 
      style={[getStateStyles(), containerStyle]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `Video file ${file.name}`}
      accessibilityRole={selectable ? "button" : "text"}
      accessibilityState={{
        selected: state === 'selected',
        disabled: state === 'disabled',
      }}
    >
      {/* Main content row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {renderThumbnail()}
        {renderMainInfo()}
        {renderStateIndicator()}
      </View>

      {/* Detailed metadata */}
      {renderDetails()}

      {/* Action buttons */}
      {renderActions()}
    </View>
  );

  if (isInteractive && onPress) {
    return (
      <Pressable 
        onPress={onPress}
        disabled={!isInteractive}
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};