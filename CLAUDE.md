# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile Video Converter Android App - an offline React Native Expo application that converts video files to web-optimized MP4 format using device processing power. Built with TypeScript, NativeWind (Tailwind CSS), and Google's Media3 library for hardware-accelerated video processing.

## Development Commands

### Setup and Start
```bash
npm install                          # Install dependencies
npx expo start --dev-client         # Start development server
npm run android                     # Run on Android device/emulator
npx expo prebuild                   # Generate native Android project
```

### Build Commands
```bash
npm run build:android:development   # Development APK build
npm run build:android:preview       # Preview APK build
npm run build:android               # Production app bundle
```

### Quality
```bash
npm run lint                        # ESLint code analysis
npm run typecheck                   # TypeScript type checking
```

## Architecture Overview

### Core Technologies
- **React Native 0.76.9** with Expo 52
- **TypeScript 5.9** with strict mode enabled
- **NativeWind 2.0** for Tailwind CSS styling
- **Google Media3** for hardware-accelerated video processing
- **Zustand 4.4** for state management

### Directory Structure
```
src/
├── components/              # Atomic Design Components
│   ├── atoms/              # Basic UI elements (Button, Text, Input)
│   ├── molecules/          # Composite components (FileCard, ProgressCard)
│   └── organisms/          # Complex sections
├── screens/                # Main app screens
├── services/               # Business logic and external APIs
│   ├── implementations/    # Concrete service implementations
│   ├── VideoProcessorService.ts    # Core video processing interface
│   └── VideoProcessorFactory.ts   # Service factory pattern
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand state management
├── types/                  # TypeScript type definitions
│   └── models/            # Domain model types
└── utils/                  # Helper functions
```

### Video Processing Architecture

The app uses a service-oriented architecture for video processing:

1. **VideoProcessorService Interface** - Defines conversion contract
2. **Media3VideoProcessor** - Hardware-accelerated implementation using Google's Media3
3. **Session Management** - Tracks conversion progress with states (CREATED, PROCESSING, COMPLETED, etc.)
4. **Event System** - Real-time progress updates via React Native event emitters
5. **Device Monitoring** - Thermal and battery state monitoring during processing

### State Management Pattern

Uses Zustand stores organized by domain:
- `conversionStore` - Active conversion jobs and progress
- `fileStore` - File selection and management
- `settingsStore` - App configuration and preferences
- `deviceStore` - Device capabilities and resource monitoring

### Component Architecture

Follows Atomic Design principles:
- **Atoms**: Basic UI components with TypeScript props and NativeWind styling
- **Molecules**: Composite components combining atoms (forms, cards)
- **Templates**: Screen layouts and navigation structure

All components use:
- Strict TypeScript interfaces with JSDoc
- NativeWind Tailwind CSS classes (NO inline styles)
- Error boundaries for React Native stability
- Performance optimizations (memo, useCallback)

## Code Conventions

### TypeScript Requirements
- **Strict mode enabled** - All strict compiler options active
- **No `any` types** - Use proper type definitions
- **Path aliases** - Use `@/`, `@components/`, `@services/` etc.
- **Interface documentation** - JSDoc comments on all public interfaces

### Styling Standards
- **NativeWind only** - Use `className` with Tailwind classes
- **No inline styles** - All styling through Tailwind utilities
- **Design system colors**:
  - Primary: `#2f6690` (blue-600 equivalent)
  - Secondary: `#3a7ca5`
  - Neutral: `#d9dcd6`


### File Organization
- **Atomic structure** - Components organized by complexity level
- **Index exports** - Each directory has index.ts for clean imports
- **Service abstractions** - Interfaces separate from implementations
- **Type definitions** - Centralized in `types/models/` directory

## Native Module Integration

### Media3 Video Processor
The app integrates with a custom Android native module for video processing:
- **Module name**: `Media3VideoProcessor`
- **Events**: Progress updates, completion, and error handling
- **Session management**: Unique session IDs for tracking conversions
- **Hardware acceleration**: Leverages device GPU when available

### Required Permissions
- `CAMERA` - Video recording functionality
- `RECORD_AUDIO` - Audio recording for videos
- `READ_EXTERNAL_STORAGE` - File access
- `WRITE_EXTERNAL_STORAGE` - File writing
- `MANAGE_EXTERNAL_STORAGE` - Enhanced file management

## Development Notes

### EAS Build Configuration
- **Development**: APK builds with dev client
- **Preview**: Internal APK distribution
- **Production**: App bundle for Play Store

### Performance Considerations
- **Thermal monitoring** - Conversion pauses if device overheats
- **Battery optimization** - Warns on low battery during processing
- **Memory management** - Monitors RAM usage during conversion
- **Hardware acceleration** - Uses Media3 GPU acceleration when available

### Common Patterns
- **Error handling**: Custom `ProcessingError` class with typed error categories
- **Progress tracking**: Real-time updates with percentage and time estimates
- **Resource cleanup**: Automatic session cleanup and temporary file removal
- **Device adaptation**: Quality settings adjust based on device capabilities


## Important File Locations

- `src/services/VideoProcessorService.ts` - Core video processing interface
- `src/services/implementations/Media3VideoProcessor.ts` - Main video processor
- `src/types/models/` - All TypeScript type definitions
- `android/app/build.gradle` - Android build configuration
- `app.json` - Expo configuration with permissions