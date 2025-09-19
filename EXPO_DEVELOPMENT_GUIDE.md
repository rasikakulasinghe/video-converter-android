# Video Converter Expo Development Build Guide

## 🎉 Configuration Complete!

Your React Native CLI video converter has been successfully reconfigured as an **Expo Development Build** project with native module support, following the reference architecture.

## 🔧 What's Configured

### ✅ Development Build Setup
- **expo-dev-client**: Configured for native module support
- **Scripts Updated**: `npm start` now uses `--dev-client` flag
- **Native Stack Navigation**: Using `@react-navigation/native-stack`
- **Doctor Configuration**: Excludes known native modules from compatibility checks

### ✅ Native Module Support
- **FFmpeg-kit-react-native**: ✅ Supported in development builds
- **react-native-fs**: ✅ Native file system access
- **react-native-haptic-feedback**: ✅ Haptic feedback support
- **All other native modules**: ✅ Fully compatible

### ✅ Build Profiles
- **Development**: APK with dev tools and debugging
- **Preview**: Production-like APK for testing
- **Production**: App Bundle for Play Store

## 🚀 Development Workflow

### 1. Start Development Server
```bash
npm start
# or
expo start --dev-client
```

### 2. Build Development APK (First Time)
```bash
# Login to Expo (create free account if needed)
expo login

# Build development APK with native modules
eas build --platform android --profile development
```

### 3. Install Development Build on Device
- Download the APK from EAS Build
- Install on your Android device
- Launch the app and connect to your development server

### 4. Development with Hot Reload
- Make changes to your code
- See instant updates on your device
- Full native module functionality available

## 📱 Build Commands

### Development Build (Recommended for Testing)
```bash
eas build --platform android --profile development
```
- Includes debugging tools
- Connects to development server
- Full native module support
- APK format for easy installation

### Preview Build (Production Testing)
```bash
eas build --platform android --profile preview
```
- Production-like build
- No development tools
- APK format for testing
- Test before Play Store submission

### Production Build
```bash
eas build --platform android --profile production
```
- Optimized for release
- App Bundle format
- Ready for Google Play Store

## 🔍 Native Module Integration

### FFmpeg Video Processing
```typescript
import { FFmpegKit } from 'ffmpeg-kit-react-native';

// Works in development builds!
const session = await FFmpegKit.execute(command);
```

### File System Operations
```typescript
import RNFS from 'react-native-fs';
import * as FileSystem from 'expo-file-system';

// Both work - choose based on your needs
const files = await RNFS.readDir(path);
const info = await FileSystem.getInfoAsync(path);
```

## 🎯 Key Differences from Standard Expo

| Feature | Standard Expo | Development Build |
|---------|---------------|-------------------|
| Native Modules | ❌ Limited | ✅ Full Support |
| FFmpeg | ❌ No | ✅ Yes |
| File System | ✅ Expo only | ✅ Both Expo + RN |
| Build Size | ⚡ Smaller | 📦 Larger |
| Development | 📱 Expo Go | 🔧 Custom APK |

## 🛠 Troubleshooting

### 1. Build Fails
```bash
# Clear cache and retry
expo r -c
eas build --platform android --profile development --clear-cache
```

### 2. Native Module Not Found
- Check if module is in dependencies
- Verify it's included in doctor.exclude list
- Rebuild development APK

### 3. Hot Reload Issues
```bash
# Restart development server
expo start --dev-client --clear
```

### 4. Permissions Issues
- Check app.json permissions configuration
- Verify runtime permissions in code
- Test on physical device, not emulator

## 📁 Project Structure

```
Video Converter - Android/
├── app.json                 # Expo configuration
├── eas.json                 # Build configuration
├── package.json            # Dependencies with dev-client setup
├── App.tsx                 # Simple demo app
├── App.complex.tsx         # Full video converter app
├── src/                    # Your application code
│   ├── components/         # UI components
│   ├── screens/           # App screens
│   ├── services/          # Business logic (FFmpeg, etc.)
│   └── ...
└── VideoConverterExpo/    # Original Expo project (backup)
```

## 🔄 Switching Between App Versions

### Enable Full Video Converter
```bash
mv App.tsx App.simple.tsx
mv App.complex.tsx App.tsx
```

### Back to Simple Demo
```bash
mv App.tsx App.complex.tsx
mv App.simple.tsx App.tsx
```

## 📊 Performance Considerations

### Development Build
- **Larger Size**: ~50-100MB (includes dev tools)
- **Slower**: Development optimizations
- **Full Features**: All native modules work

### Production Build
- **Optimized Size**: ~20-40MB
- **Faster**: Production optimizations
- **Release Ready**: App Store distribution

## 🎉 Success Indicators

✅ **Native modules working**: FFmpeg processes videos
✅ **Development workflow**: Hot reload with native code
✅ **Build system**: EAS generates APKs successfully
✅ **Testing ready**: Install APK and test on device
✅ **Production ready**: Can build for Play Store

## 🚀 Next Steps

1. **Build development APK**: `eas build --platform android --profile development`
2. **Test on device**: Install APK and verify video conversion
3. **Develop features**: Use hot reload for rapid development
4. **Build for production**: `eas build --platform android --profile production`

Your video converter now has the full power of React Native with the convenience of Expo's development tools!