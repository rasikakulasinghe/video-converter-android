# NativeWind Web Bundling Fix

**Issue:** `Unable to resolve "nativewind/jsx-dev-runtime" from "node_modules\expo\src\launch\withDevTools.web.tsx"`

**Cause:** NativeWind's JSX runtime is not compatible with web platform, but Babel was trying to use it for all platforms.

---

## Solutions Applied

### 1. Babel Config - Platform Detection
**File:** [babel.config.js](../babel.config.js)

```javascript
module.exports = function (api) {
  // Detect web platform from caller BEFORE setting cache
  const isWeb = api.caller((caller) => caller?.platform === 'web');

  // Cache configuration based on platform
  api.cache.using(() => isWeb ? 'web' : 'native');

  return {
    presets: [
      ['babel-preset-expo', isWeb ? {} : { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      ...(isWeb ? [] : ['nativewind/babel']),
      'react-native-reanimated/plugin',
    ],
  };
};
```

**What it does:**
- Detects when building for web platform
- **IMPORTANT:** Calls `api.caller()` BEFORE `api.cache()` to avoid caching errors
- Uses platform-specific cache invalidation
- Disables NativeWind JSX import source on web
- Disables NativeWind Babel plugin on web
- Keeps NativeWind enabled for Android/iOS

### 2. Metro Config - Module Resolution
**File:** [metro.config.js](../metro.config.js)

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver to handle nativewind on web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Skip nativewind JSX runtime on web
    if (
      platform === 'web' &&
      (moduleName === 'nativewind/jsx-dev-runtime' || moduleName === 'nativewind/jsx-runtime')
    ) {
      return {
        type: 'empty',
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
```

**What it does:**
- Intercepts module resolution for web platform
- Returns empty module for NativeWind JSX runtimes
- Prevents bundler from trying to include incompatible modules

---

## How to Apply the Fix

### Step 1: Clear Cache
```bash
# Clear Metro bundler cache
rm -rf .expo node_modules/.cache

# Or use npm script
npm run clean
```

### Step 2: Restart Metro
```bash
# Stop the current Metro bundler (Ctrl+C)
# Then restart
npx expo start
```

### Step 3: Test Web Platform
```bash
# Press 'w' in Metro terminal to open web
# Or navigate to http://localhost:8081
```

---

## Expected Behavior

### ✅ After Fix
- **Android:** NativeWind works normally with Tailwind classes
- **iOS:** NativeWind works normally with Tailwind classes
- **Web:** Builds successfully without NativeWind (uses standard React Native Web styling)

### Platform-Specific Styling

**Android/iOS (with NativeWind):**
```tsx
<View className="flex-1 bg-primary p-4">
  <Text className="text-2xl font-bold">Hello</Text>
</View>
```

**Web (without NativeWind):**
```tsx
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>
```

---

## Why This Happens

1. **NativeWind is Native-Only:** NativeWind uses native styling APIs that don't exist on web
2. **Babel JSX Transform:** The `jsxImportSource` setting in Babel tried to use NativeWind's JSX runtime for all platforms
3. **Web Incompatibility:** React Native Web has its own styling system incompatible with NativeWind

---

## Alternative Solutions

### Option A: Disable Web Platform Entirely
If you don't need web support, remove it from package.json:

```json
{
  "scripts": {
    "start": "expo start --dev-client",
    "android": "expo run:android",
    // Remove: "web": "expo start --web"
  }
}
```

### Option B: Use Platform-Specific Code
Create platform-specific components:

```
components/
  Button.tsx          # Shared interface
  Button.native.tsx   # Android/iOS with NativeWind
  Button.web.tsx      # Web with standard styles
```

### Option C: Unified Styling (Current Approach)
This app uses StyleSheet for cross-platform compatibility:

```tsx
// Works on all platforms
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f6690',
    padding: 16,
  },
});
```

---

## Project Recommendation

**For This Android-Focused App:**
- Keep current fix (supports web for testing)
- Use NativeWind for Android production builds
- Accept limited web styling (development only)

**Why:** This is primarily an Android video converter app. Web support is mainly for development/testing convenience.

---

## Troubleshooting

### Issue: Still Getting NativeWind Errors on Web
```bash
# 1. Clear all caches
npm run clean
rm -rf .expo node_modules/.cache

# 2. Clear Metro cache explicitly
npx expo start --clear

# 3. If still failing, clear node_modules
rm -rf node_modules
npm install
```

### Issue: Android Build Broken
```bash
# Verify NativeWind is working on Android
npx expo run:android

# Check babel config is correct
cat babel.config.js
```

### Issue: Styles Not Working
- **On Android:** NativeWind should work with `className`
- **On Web:** Use StyleSheet instead of `className`
- Check if platform detection is correct in babel.config.js

---

## References

- [NativeWind Docs](https://www.nativewind.dev/)
- [Expo Web Support](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Metro Bundler Config](https://facebook.github.io/metro/docs/configuration/)

---

**Fix Applied:** 2025-10-02
**Status:** ✅ Web bundling now works
**Impact:** No breaking changes for Android/iOS
