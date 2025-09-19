import React, { useCallback } from 'react';
import { View, ViewStyle, Modal, Pressable, Dimensions } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Icon, IconName } from '../atoms/Icon';

/**
 * Action item configuration
 */
export interface ActionItem {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action */
  label: string;
  /** Icon to display with the action */
  icon?: IconName;
  /** Whether the action is destructive (red styling) */
  destructive?: boolean;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Callback when action is pressed */
  onPress: () => void;
}

/**
 * Action section configuration
 */
export interface ActionSection {
  /** Section title (optional) */
  title?: string;
  /** Actions in this section */
  actions: ActionItem[];
}

/**
 * Props for the ActionSheet component
 */
export interface ActionSheetProps {
  /** Whether the action sheet is visible */
  visible: boolean;
  /** Title for the action sheet */
  title?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Array of action sections */
  sections: ActionSection[];
  /** Whether to show a cancel button */
  showCancel?: boolean;
  /** Custom cancel button label */
  cancelLabel?: string;
  /** Whether to close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom backdrop style */
  backdropStyle?: ViewStyle;
  /** Callback when action sheet should be dismissed */
  onDismiss: () => void;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * ActionSheet Component
 * 
 * A molecular component that displays a modal bottom sheet with configurable
 * actions. Composes Button, Text, and Icon atoms in a modal overlay.
 * 
 * @example
 * ```tsx
 * <ActionSheet
 *   visible={showActions}
 *   title="Video Actions"
 *   sections={[
 *     {
 *       title: "Conversion",
 *       actions: [
 *         {
 *           id: "convert",
 *           label: "Start Conversion",
 *           icon: "play",
 *           onPress: () => startConversion()
 *         }
 *       ]
 *     }
 *   ]}
 *   onDismiss={() => setShowActions(false)}
 * />
 * ```
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  subtitle,
  sections,
  showCancel = true,
  cancelLabel = 'Cancel',
  closeOnBackdrop = true,
  containerStyle,
  backdropStyle,
  onDismiss,
  testID = 'action-sheet',
  accessibilityLabel,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const maxSheetHeight = screenHeight * 0.8;

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      onDismiss();
    }
  }, [closeOnBackdrop, onDismiss]);

  // Handle action press
  const handleActionPress = useCallback((action: ActionItem) => {
    if (!action.disabled) {
      action.onPress();
      onDismiss();
    }
  }, [onDismiss]);

  // Render action item
  const renderAction = useCallback((action: ActionItem) => {
    return (
      <Button
        key={action.id}
        variant="ghost"
        size="lg"
        leftIcon={action.icon ? <Icon name={action.icon} size="md" color={action.destructive ? 'error' : 'primary'} /> : undefined}
        onPress={() => handleActionPress(action)}
        disabled={action.disabled || false}
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 0,
        }}
        testID={`${testID}-action-${action.id}`}
      >
        {action.label}
      </Button>
    );
  }, [testID, handleActionPress]);

  // Render action section
  const renderSection = useCallback((section: ActionSection, index: number) => {
    return (
      <View 
        key={index}
        style={{ 
          marginBottom: index < sections.length - 1 ? 8 : 0 
        }}
      >
        {section.title && (
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text variant="caption" color="muted" weight="medium">
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: section.title ? 0 : 12,
            overflow: 'hidden',
          }}
        >
          {section.actions.map((action, actionIndex) => (
            <View key={action.id}>
              {renderAction(action)}
              {actionIndex < section.actions.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#f0f0f0',
                    marginHorizontal: 20,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }, [sections, renderAction]);

  // Render sheet header
  const renderHeader = useCallback(() => {
    if (!title && !subtitle) return null;

    return (
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        {/* Handle bar */}
        <View
          style={{
            width: 36,
            height: 4,
            backgroundColor: '#d0d0d0',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />

        {title && (
          <Text
            variant="heading"
            weight="semibold"
            style={{ textAlign: 'center', marginBottom: 4 }}
            testID={`${testID}-title`}
          >
            {title}
          </Text>
        )}

        {subtitle && (
          <Text
            variant="body"
            color="muted"
            style={{ textAlign: 'center' }}
            testID={`${testID}-subtitle`}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  }, [title, subtitle, testID]);

  // Render cancel button
  const renderCancelButton = useCallback(() => {
    if (!showCancel) return null;

    return (
      <View style={{ marginTop: 8 }}>
        <Button
          variant="outline"
          size="lg"
          onPress={onDismiss}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            marginHorizontal: 16,
          }}
          testID={`${testID}-cancel-button`}
        >
          {cancelLabel}
        </Button>
      </View>
    );
  }, [showCancel, cancelLabel, onDismiss, testID]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onDismiss}
      testID={testID}
    >
      {/* Backdrop */}
      <Pressable
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          },
          backdropStyle,
        ]}
        onPress={handleBackdropPress}
        testID={`${testID}-backdrop`}
      >
        {/* Sheet Container */}
        <Pressable
          style={[
            {
              maxHeight: maxSheetHeight,
              backgroundColor: '#f8f9fa',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 34, // Safe area bottom
            },
            containerStyle,
          ]}
          onPress={(e) => e.stopPropagation()} // Prevent backdrop press
          accessible={true}
          accessibilityLabel={accessibilityLabel || 'Action sheet'}
          accessibilityRole="menu"
        >
          {renderHeader()}

          {/* Sections */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            {sections.map(renderSection)}
          </View>

          {renderCancelButton()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};