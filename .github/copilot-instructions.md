# GitHub Copilot Instructions: Mobile Video Converter Android App

**Project**: Mobile Video Converter Android App  
**Date**: September 17, 2025  
**Constitution**: v1.0.0  
**Last Updated**: Initial Setup

## Project Overview

You are working on a **Mobile Video Converter Android App** - an offline React Native application that converts video files to web-optimized MP4 format using device processing power. The app features touch-optimized Material Design UI, real-time progress tracking, device resource management, and APK distribution capabilities.

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
// Required packages and versions
"react-native": "^0.73.0"
"typescript": "^5.0.0"
"@ffmpeg-kit/react-native": "^5.1.0"
"react-native-fs": "^2.20.0"
"zustand": "^4.4.0"
"nativewind": "^2.0.11"
"react-navigation": "^6.0.0"
"react-native-device-info": "^10.0.0"
```

### Architecture Pattern
```
src/
├── components/
│   ├── atoms/           # Buttons, Icons, Text
│   ├── molecules/       # Forms, Cards, Progress
│   ├── organisms/       # Complex UI sections
│   └── templates/       # Screen layouts
├── screens/             # Main, Settings, Results
├── services/            # Video, File, Device, Settings
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── types/               # TypeScript definitions
└── utils/               # Helper functions
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
jest.mock('@ffmpeg-kit/react-native', () => ({
  FFmpegKit: {
    execute: jest.fn(),
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

### FFmpeg Integration
```typescript
// Always use FFmpeg Kit React Native patterns
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';

const convertVideo = async (input: string, output: string) => {
  const command = `-i ${input} -c:v libx264 -c:a aac ${output}`;
  
  const session = await FFmpegKit.executeAsync(
    command,
    (session) => {
      // Completion callback
    },
    (log) => {
      // Progress callback
    },
    (statistics) => {
      // Statistics callback for progress
    }
  );
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
1. **Project Setup**: Initial React Native 0.73 project configuration
2. **Constitutional Requirements**: Established component-driven development standards
3. **Technical Stack**: Selected FFmpeg Kit, Zustand, NativeWind architecture
4. **Design System**: Defined Material Design color palette and spacing

### Upcoming Work
1. **Phase 1**: Atomic component library implementation
2. **Phase 2**: Video processing service development
3. **Phase 3**: Device resource monitoring integration
4. **Phase 4**: APK build and distribution setup

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