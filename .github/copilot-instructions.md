# Video Converter Android - AI Development Guide

## Project Architecture

This is an **offline React Native Expo app** for video conversion using **Google Media3** hardware acceleration. The app follows strict TypeScript patterns, service-oriented architecture, and factory design patterns.

### Core Services & Factories

**Video Processing Pipeline:**
- `VideoProcessorFactory.getInstance()` - Platform-specific video processor (Media3 on Android, Mock on web/iOS)
- `Media3VideoProcessor` - Hardware-accelerated implementation using native Android module
- Session management through `ConversionSession` with states: `CREATED → PROCESSING → COMPLETED/FAILED`
- Real-time progress events via `NativeEventEmitter` with session IDs

**File Management Pipeline:**
- `FileManagerFactory.getInstance()` - Platform-specific file handlers
- `ReactNativeFileManager` - Production implementation with RNFS
- Video discovery through `findVideoFiles()` with format validation

### State Management (Zustand)

**Domain-driven stores:**
```typescript
// Conversion jobs with progress tracking
conversionStore: { jobs, startConversion, cancelConversion }

// File selection and validation  
fileStore: { selectedFiles, videoFiles, validateVideoFile }

// Device thermal/battery monitoring
deviceStore: { thermalState, batteryLevel, capabilities }
```

**Critical Pattern:** All stores use factory pattern for service injection - never instantiate services directly.

## TypeScript & Styling Standards

### Strict TypeScript Configuration
```json
// All strict flags enabled - NO exceptions
"strictNullChecks": true,
"noUncheckedIndexedAccess": true, 
"exactOptionalPropertyTypes": true
```

**Path aliases enforced:**
```typescript
import { Button } from '@components/atoms';
import { VideoFile } from '@/types/models';
```

### NativeWind v2 Styling (NO Inline Styles)
```tsx
// ✅ CORRECT - Use className only
<View className="flex-1 bg-primary p-4" />

// ❌ WRONG - Never use inline styles  
<View style={{ flex: 1, backgroundColor: '#2f6690' }} />
```

**Design system colors (use in Tailwind):**
- `bg-primary` = `#2f6690`
- `bg-secondary` = `#3a7ca5`  
- `bg-neutral` = `#d9dcd6`

## Component Patterns (Atomic Design)

### Atoms Structure
```tsx
// All atoms follow this interface pattern
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: string; // Strict string typing
}
```

### Critical File Locations
- `src/services/VideoProcessorService.ts` - Core video processing contract
- `src/services/implementations/Media3VideoProcessor.ts` - Android native integration  
- `src/types/media3-video-processor.d.ts` - Native module type definitions
- `src/stores/conversionStore.ts` - Main conversion logic and session management

## Native Module Integration

**Media3VideoProcessor** communicates via:
```typescript
// Event-driven architecture
EVENT_CONVERSION_PROGRESS: 'Media3VideoProcessor_ConversionProgress'
EVENT_CONVERSION_COMPLETE: 'Media3VideoProcessor_ConversionComplete'

// Session-based operations
convertVideo(sessionId: string, config: Media3ConversionConfig)
cancelConversion(sessionId: string)
```

## Development Workflows

### Build Commands (EAS)
```bash
npm run build:android:development  # Dev client APK
npm run build:android:preview      # Internal testing APK  
npm run build:android              # Play Store bundle
```

### Quality Gates
```bash
npm run dev:check    # Fast typecheck + lint for development
npm run prebuild:prod # Full validation before production builds
```

**Important:** Always run `npx expo prebuild` after changing native dependencies or permissions.

### Common Debugging Patterns
- Use `VideoProcessorFactory.getImplementationName()` to verify active processor
- Check `deviceStore.thermalState` for overheating during conversion failures
- Monitor `conversionStore.jobs` for session state debugging

## Integration Points

**Platform Differences:**
- Android: Full Media3 video processing
- Web/iOS: Mock processor with graceful degradation
- Factory pattern ensures consistent API across platforms

**Permission Requirements:** Camera, storage, and audio permissions auto-configured in `app.json` - modify there, not in native code.

**File Validation:** All video inputs must pass through `validateVideoFile()` before processing - handles format checking and metadata extraction.