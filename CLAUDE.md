# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Run tests
npm test

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

### Android Build
```bash
# Build release APK
npm run build:android

# Clean Android build
npm run clean
```

### Testing
```bash
# Run specific test file
npm test -- --testPathPattern=Button.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Architecture Overview

### Core Technology Stack
- **Framework**: React Native 0.73.9 with TypeScript 5.0+
- **Video Processing**: FFmpeg Kit React Native 5.1.0 for offline conversion
- **State Management**: Zustand 4.4.0 with subscribeWithSelector middleware
- **Styling**: NativeWind 2.0.11 (Tailwind CSS for React Native)
- **Navigation**: React Navigation 6.x Stack Navigator
- **File System**: React Native FS for file operations
- **Testing**: Jest + React Native Testing Library with 80% coverage threshold

### Project Structure
```
src/
├── components/
│   ├── atoms/           # Basic UI elements (Button, Text, Icon, etc.)
│   ├── molecules/       # Composite components (FileCard, ProgressCard, etc.)
│   └── organisms/       # Complex UI sections
├── screens/             # Main app screens (MainScreen, SettingsScreen, ResultsScreen)
├── services/            # Core business logic services
│   ├── VideoProcessorService.ts    # Video conversion interface
│   ├── FileManagerService.ts       # File operations
│   ├── DeviceMonitorService.ts     # Device health monitoring
│   └── implementations/            # Concrete service implementations
├── stores/              # Zustand state management
│   ├── conversionStore.ts          # Job queue and progress tracking
│   ├── settingsStore.ts            # User preferences
│   ├── fileStore.ts                # File selection state
│   └── deviceStore.ts              # Device capabilities monitoring
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
│   └── models/          # Core domain models
└── utils/               # Helper functions
```

### State Management Architecture
This app uses a multi-store Zustand architecture:

- **ConversionStore**: Manages video conversion jobs, queue system, progress tracking, and statistics
- **SettingsStore**: Handles user preferences, quality settings, and app configuration
- **FileStore**: Manages file selection state and metadata
- **DeviceStore**: Monitors device capabilities, thermal state, and resource availability

Key pattern: Stores use `subscribeWithSelector` middleware for granular reactivity and include both state and actions in a single interface.

### Service Layer Architecture
Services follow dependency injection patterns with TypeScript interfaces:

- **VideoProcessorService**: Core video conversion using FFmpeg sessions
- **FileManagerService**: File operations, permissions, and gallery integration
- **DeviceMonitorService**: Real-time device health and resource monitoring
- **SettingsService**: Persistent settings management with AsyncStorage

Services are implemented as classes that implement interfaces, allowing for easy testing and swapping implementations.

### Video Processing Pipeline
1. **File Selection**: Native file picker or camera capture
2. **Video Analysis**: FFmpeg probe for metadata and format validation
3. **Session Creation**: Creates conversion session with progress tracking
4. **Processing**: FFmpeg conversion with real-time progress updates
5. **Device Monitoring**: Thermal and battery monitoring during processing
6. **Result Handling**: File save to gallery/app folder with cleanup

The video processor uses FFmpeg Kit's session-based API for better resource management and progress tracking.

## Component Development Patterns

### Atomic Design Structure
Follow strict atomic design hierarchy:
- **Atoms**: Single-purpose components (Button, Text, Icon)
- **Molecules**: Combinations of atoms (FileCard, ProgressCard)
- **Organisms**: Complex feature sections
- **Templates**: Screen layout structures

### TypeScript Requirements
- Use strict TypeScript configuration
- Never use `any` type
- All component props must have JSDoc documentation
- Prefer interfaces over types for component props
- Use proper return type annotations

### Styling with NativeWind
- Use only Tailwind CSS classes via NativeWind
- NO inline styles allowed (enforced by ESLint)
- Follow 8px spacing system (p-1, p-2, p-4, etc.)
- Use design system colors: primary (#2f6690), secondary (#3a7ca5), neutral (#d9dcd6)

### Example Component Pattern
```typescript
interface ButtonProps {
  /** Button text content */
  title: string;
  /** Press handler function */
  onPress: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
  /** Loading state */
  isLoading?: boolean;
}

const Button = ({ title, onPress, variant = 'primary', isLoading }: ButtonProps) => {
  const handlePress = useCallback(() => {
    if (!isLoading) {
      onPress();
    }
  }, [onPress, isLoading]);

  return (
    <Pressable
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' ? 'bg-blue-600' : 'bg-gray-600',
        isLoading && 'opacity-50'
      )}
      onPress={handlePress}
      disabled={isLoading}
    >
      <Text className="text-white font-medium">{title}</Text>
    </Pressable>
  );
};
```

## Testing Strategy

### Coverage Requirements
- Minimum 80% coverage across branches, functions, lines, and statements
- Use TDD approach: write tests first, then implement
- Test files located alongside source files with `.test.tsx` extension

### Component Testing
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test" onPress={onPress} />);

    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Service Testing
Mock external dependencies (FFmpeg, React Native modules) and test business logic thoroughly.

## Important Configuration Files

### Path Aliases (jest.config.js)
```javascript
moduleNameMapping: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@components/(.*)$': '<rootDir>/src/components/$1',
  '^@screens/(.*)$': '<rootDir>/src/screens/$1',
  '^@services/(.*)$': '<rootDir>/src/services/$1',
  // ... other aliases
}
```

### ESLint Rules
- No explicit `any` types
- No inline styles
- No unused variables
- Strict TypeScript rules enabled
- React Native specific rules enforced

### FFmpeg Integration
Uses FFmpeg Kit React Native for video processing:
- Session-based API for better resource management
- Real-time progress callbacks
- Thermal monitoring integration
- Hardware acceleration when available

## Device Considerations

### Resource Management
- Monitor device temperature during conversion
- Handle low battery scenarios (warn below 20%)
- Check available storage before conversion
- Implement thermal throttling

### Permissions
- Storage permissions for file access
- Camera permissions for video recording
- Handle permission denials gracefully

### Performance
- Target Android 8.0+ (API 26)
- Support ARM64 and ARM32 architectures
- Optimize for low-end devices
- Background processing with notifications

## Common Patterns

### Error Handling
Always use proper error boundaries and typed error objects:
```typescript
interface ProcessingError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### Async Operations
Use proper async/await patterns with error handling:
```typescript
const handleConversion = async () => {
  try {
    await conversionStore.startConversion(request);
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

### Navigation
Type-safe navigation with proper param typing:
```typescript
type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  Results: { videoFile: VideoFile };
};
```

This architecture supports the app's core mission: providing reliable, offline video conversion with excellent mobile UX and comprehensive device resource management.