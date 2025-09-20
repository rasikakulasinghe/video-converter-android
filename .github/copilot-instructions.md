# GitHub Copilot Instructions: Mobile Video Converter Android App

**Project**: Mobile Video Converter Android App  
**Date**: September 20, 2025  
**Constitution**: v1.1.0  
**Last Updated**: Project Implementation Phase

## Project Overview

You are working on a **Mobile Video Converter Android App** - an offline Expo React Native application that converts video files to web-optimized MP4 format using Android Media3 processing power. The app features touch-optimized Material Design UI, real-time progress tracking, device resource management, and EAS build distribution capabilities.

## Constitutional Requirements (NON-NEGOTIABLE)

### Component-Driven Development
- **Atomic Design**: Use atoms/molecules/organisms/templates structure
- **React Native Components**: Self-contained, reusable components only
- **TypeScript Interfaces**: Comprehensive prop interfaces with JSDoc
- **NativeWind Styling**: Tailwind CSS classes only, NO inline styles
- **Single Responsibility**: Each component has one clear purpose

### TypeScript Excellence
- **Strict Configuration**: TypeScript 5.0+ with strict: true
- **Zero Any Types**: Never use `any`, always provide proper types
- **Functional Patterns**: Custom hooks for reusable logic
- **ES6+ Required**: destructuring, async/await, template literals mandatory

### Test Coverage (80% Minimum)
- **TDD Approach**: Write tests → Get approval → Tests fail → Implement
- **Jest + React Native Testing Library**: For component testing
- **Integration Tests**: Real video file testing with device scenarios
- **Performance Tests**: Video processing workflow validation

## Technical Stack

### Core Technologies
```typescript
// Required packages and versions (Current Implementation)
"expo": "~52.0.47"
"react-native": "0.76.9"
"typescript": "~5.9.2"
"react-native-fs": "^2.20.0"
"zustand": "^4.4.0"
"nativewind": "^2.0.11"
"@react-navigation/native": "^7.1.17"
"@react-navigation/native-stack": "^7.2.0"
"react-native-device-info": "^14.1.1"
"expo-av": "~15.0.2"
"expo-file-system": "~18.0.12"
"expo-document-picker": "~13.0.3"
"@react-native-async-storage/async-storage": "1.23.1"
```

### Architecture Pattern
```
src/
├── components/
│   ├── atoms/           # Button, Icon, Input, ProgressBar, Text
│   ├── molecules/       # ActionSheet, ConversionForm, FileCard, ProgressCard
│   ├── organisms/       # Complex UI sections (TBD)
│   └── templates/       # Screen layouts (TBD)
├── screens/             # MainScreen, ResultsScreen, SettingsScreen
├── services/            # VideoProcessor, FileManager, Device, Settings
│   └── implementations/ # Service implementations
├── hooks/               # useFileManager, useVideoProcessor
├── stores/              # conversionStore, deviceStore, fileStore, settingsStore
├── types/               # TypeScript definitions
│   └── models/          # Data models and interfaces
├── utils/               # Helper functions (cn.ts)
└── navigation/          # Navigation configuration

tests/
├── contract/            # Service contract tests
├── integration/         # End-to-end scenario tests
├── performance/         # Performance benchmarks
├── unit/                # Unit tests
├── models/              # Model validation tests
├── services/            # Service-specific tests
└── mocks/               # Test mocks and fixtures
```

## Code Style Guidelines

### Component Structure
```typescript
// Always follow this pattern
interface ComponentProps {
  /** Clear JSDoc for each prop */
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const Component = ({ title, onPress, variant = 'primary' }: ComponentProps) => {
  // Custom hooks first
  const { theme } = useTheme();
  
  // Event handlers
  const handlePress = useCallback(() => {
    hapticFeedback();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' ? 'bg-blue-600' : 'bg-gray-600'
      )}
      onPress={handlePress}
    >
      <Text className="text-white font-medium">{title}</Text>
    </Pressable>
  );
};
```

### Service Implementation
```typescript
// Services use interfaces and dependency injection
interface VideoProcessorService {
  convertVideo(request: ConversionRequest): Promise<ConversionResult>;
  analyzeVideo(filePath: string): Promise<VideoMetadata>;
}

class FFmpegVideoProcessor implements VideoProcessorService {
  async convertVideo(request: ConversionRequest): Promise<ConversionResult> {
    // Implementation with proper error handling
  }
}
```

### State Management
```typescript
// Zustand stores with TypeScript
interface ConversionStore {
  currentJob: ConversionJob | null;
  progress: ConversionProgress;
  startConversion: (request: ConversionRequest) => Promise<void>;
  cancelConversion: () => Promise<void>;
}

const useConversionStore = create<ConversionStore>((set, get) => ({
  currentJob: null,
  progress: { percentage: 0, estimatedTime: 0 },
  // Actions...
}));
```

## Design System

### Color Palette
```typescript
// Use these exact colors in Tailwind classes
const colors = {
  primary: {
    DEFAULT: '#2f6690',  // Primary Blue
    light: '#81c3d7',    // Light Blue
    dark: '#16425b',     // Dark Blue
  },
  secondary: '#3a7ca5',  // Secondary Blue
  neutral: '#d9dcd6',    // Light Gray
};
```

### Typography Scale
```typescript
// Tailwind text classes to use
'text-xs'    // 12px - Captions
'text-sm'    // 14px - Body small
'text-base'  // 16px - Body
'text-lg'    // 18px - Subheadings
'text-xl'    // 20px - Headings
'text-2xl'   // 24px - Page titles
```

### Spacing System
```typescript
// 8px base unit - use these Tailwind classes
'p-1'  // 4px    'p-2'  // 8px     'p-3'  // 12px
'p-4'  // 16px   'p-6'  // 24px    'p-8'  // 32px
'p-12' // 48px   'p-16' // 64px
```

## React Native Specific Patterns

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';
const styles = Platform.select({
  android: 'mt-6',  // Account for status bar
  default: 'mt-4',
});
```

### Performance Optimizations
```typescript
// Lazy loading for heavy components
const VideoProcessor = lazy(() => import('./VideoProcessor'));

// Memoization for expensive calculations
const videoMetadata = useMemo(() => 
  analyzeVideoFile(videoFile), [videoFile]
);

// Callback memoization
const handleProgress = useCallback((progress: number) => {
  updateProgress(progress);
}, [updateProgress]);
```

### Error Boundaries
```typescript
// Always wrap risky operations
<ErrorBoundary fallback={<ErrorMessage />}>
  <VideoConversionScreen />
</ErrorBoundary>
```

## Testing Patterns

### Component Tests
```typescript
// React Native Testing Library pattern
import { render, fireEvent } from '@testing-library/react-native';

describe('ConvertButton', () => {
  it('triggers conversion when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ConvertButton onPress={onPress} />
    );
    
    fireEvent.press(getByText('Convert'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Service Tests
```typescript
// Mock external dependencies
jest.mock('../services/implementations/Media3VideoProcessor', () => ({
  Media3VideoProcessor: {
    convertVideo: jest.fn(),
    analyzeVideo: jest.fn(),
  },
}));

describe('VideoProcessorService', () => {
  it('converts video with correct parameters', async () => {
    const result = await videoProcessor.convertVideo(mockRequest);
    expect(result.success).toBe(true);
  });
});
```

## Video Processing Guidelines

### Media3 Integration
```typescript
// Always use Android Media3 patterns
import { VideoProcessorService, ConversionRequest, ConversionResult } from '../services/VideoProcessorService';

const convertVideo = async (request: ConversionRequest): Promise<ConversionResult> => {
  const processor = VideoProcessorFactory.create();
  
  // Create conversion session
  const session = await processor.createConversionSession(request);
  
  // Start conversion with progress monitoring
  return new Promise((resolve, reject) => {
    session.onProgress((progress) => {
      // Update UI with conversion progress
      updateProgress(progress);
    });
    
    session.onComplete((result) => {
      resolve(result);
    });
    
    session.onError((error) => {
      reject(error);
    });
    
    session.start();
  });
};
```

### Resource Management
```typescript
// Monitor device resources during conversion
const useDeviceMonitor = () => {
  const [thermalState, setThermalState] = useState<ThermalState>('normal');
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const temp = await DeviceInfo.getPowerState();
      if (temp.batteryLevel < 0.2) {
        // Warn user about low battery
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
};
```

## Expo Specific Patterns

### EAS Build Configuration
```typescript
// Build commands for different environments
"scripts": {
  "build:android": "eas build --platform android",
  "build:android:preview": "eas build --platform android --profile preview",
  "build:android:development": "eas build --platform android --profile development"
}

// EAS.json profiles configured for:
// - development: APK builds for testing
// - preview: Internal distribution APKs
// - production: AAB bundles for Play Store
```

### Expo File System
```typescript
// Use Expo File System for file operations
import * as FileSystem from 'expo-file-system';

const saveConvertedVideo = async (tempUri: string, filename: string) => {
  const destUri = `${FileSystem.documentDirectory}converted/${filename}`;
  await FileSystem.makeDirectoryAsync(
    `${FileSystem.documentDirectory}converted/`,
    { intermediates: true }
  );
  await FileSystem.moveAsync({ from: tempUri, to: destUri });
  return destUri;
};
```

### Expo Document Picker
```typescript
// File selection with proper type filtering
import * as DocumentPicker from 'expo-document-picker';

const selectVideoFile = async (): Promise<VideoFile | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['video/*'],
    copyToCacheDirectory: true,
  });
  
  if (!result.canceled && result.assets[0]) {
    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      size: result.assets[0].size,
      mimeType: result.assets[0].mimeType,
    };
  }
  return null;
};
```

## Common Patterns to Use

### Navigation
```typescript
// Type-safe navigation with React Navigation
type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  Results: { videoFile: VideoFile };
};

const navigation = useNavigation<NavigationProp<RootStackParamList>>();
```

### File Operations
```typescript
// React Native FS patterns
import RNFS from 'react-native-fs';

const saveToGallery = async (filePath: string) => {
  const destPath = `${RNFS.PicturesDirectoryPath}/VideoConverter/${filename}`;
  await RNFS.copyFile(filePath, destPath);
};
```

### Permissions
```typescript
// Proper permission handling
import { PermissionsAndroid } from 'react-native';

const requestStoragePermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};
```

## Recent Changes

### Latest Updates
1. **Project Setup**: Expo React Native 0.76.9 with EAS build configuration
2. **Constitutional Requirements**: Established component-driven development standards
3. **Technical Stack**: Selected Media3, Zustand, NativeWind architecture
4. **Component Library**: Implemented atomic design components (atoms/molecules)
5. **Service Architecture**: Video processing, file management, and device monitoring services
6. **State Management**: Zustand stores for conversion, device, file, and settings
7. **Testing Infrastructure**: Comprehensive test structure with contract, integration, unit tests
8. **TypeScript Definitions**: Complete type system with models and service interfaces

### Upcoming Work
1. **Phase 1**: Complete organism and template components ✅ Partially Done
2. **Phase 2**: Video processing Media3 native implementation
3. **Phase 3**: UI integration with conversion workflow
4. **Phase 4**: EAS build optimization and APK distribution

## Important Reminders

🚫 **Never Do This**:
- Use inline styles instead of NativeWind classes
- Write `any` types in TypeScript
- Skip JSDoc comments on component props
- Implement without writing tests first
- Ignore constitutional requirements

✅ **Always Do This**:
- Follow atomic design component hierarchy
- Use TypeScript strict mode with proper types
- Write comprehensive tests before implementation
- Apply proper error boundaries for React Native
- Monitor device resources during video processing
- Use performance optimizations (memo, callback, lazy loading)

This instruction set ensures consistent, high-quality development following the constitutional requirements and React Native best practices for the Mobile Video Converter Android app.