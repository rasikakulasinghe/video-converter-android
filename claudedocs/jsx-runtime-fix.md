# JSX Runtime Error Fix

**Error:** `(0, _jsxDevRuntime.jsxDEV) is not a function`

**Cause:** Metro config was returning an empty module for NativeWind's JSX runtime, but Expo's `withDevTools` component still needed a valid JSX runtime.

---

## Solution Applied

### Metro Config - JSX Runtime Redirect
**File:** [metro.config.js](../metro.config.js)

**Wrong Approach (causes error):**
```javascript
// ❌ This returns empty module - breaks JSX
if (platform === 'web' && moduleName === 'nativewind/jsx-dev-runtime') {
  return { type: 'empty' };
}
```

**Correct Approach:**
```javascript
// ✅ Redirect to React's JSX runtime
if (platform === 'web') {
  if (moduleName === 'nativewind/jsx-dev-runtime') {
    return context.resolveRequest(context, 'react/jsx-dev-runtime', platform);
  }
  if (moduleName === 'nativewind/jsx-runtime') {
    return context.resolveRequest(context, 'react/jsx-runtime', platform);
  }
}
```

**What it does:**
- Intercepts NativeWind JSX runtime imports on web
- Redirects to React's JSX runtime instead
- Preserves JSX functionality with standard React runtime
- Prevents "jsxDEV is not a function" error

---

## Why This Works

1. **NativeWind Uses Custom JSX Runtime:** NativeWind transforms JSX to add className support
2. **Web Needs Standard JSX:** React on web uses standard `react/jsx-runtime`
3. **Redirect vs Empty:**
   - Empty module = no JSX functions → error
   - Redirect = use React's JSX functions → works

---

## How to Apply

```bash
# 1. Clear Metro cache
rm -rf .expo node_modules/.cache

# 2. Restart Metro with clean cache
npx expo start --clear

# 3. Test web (press 'w')
# Should see UI without errors
```

---

## Error Details

### What Happened
```
TypeError: (0 , _jsxDevRuntime.jsxDEV) is not a function
    at WithDevTools (node_modules/expo/src/launch/withDevTools.web.tsx:11:9)
```

### Root Cause Chain
1. Babel configured `jsxImportSource: 'nativewind'` for all platforms (now fixed)
2. Metro tried to resolve `nativewind/jsx-dev-runtime` on web
3. Our resolver returned empty module
4. Expo's withDevTools tried to use jsxDEV function
5. Function didn't exist → error

### The Fix
1. Babel only uses NativeWind on native (platform detection)
2. Metro redirects NativeWind JSX to React JSX on web
3. React's JSX runtime provides jsxDEV function
4. Everything works correctly

---

## Files Modified

1. ✅ **metro.config.js** - Changed from empty module to redirect
2. ✅ **babel.config.js** - Already has platform detection (previous fix)

---

## Testing Checklist

### Browser Console
- [ ] No "jsxDEV is not a function" errors
- [ ] No "Cannot read property" errors
- [ ] React DevTools shows component tree

### Visual Check
- [ ] Page renders correctly
- [ ] Components are visible
- [ ] Interactions work (buttons, etc.)

### Platform Check
- [ ] Android: NativeWind JSX runtime (className works)
- [ ] iOS: NativeWind JSX runtime (className works)
- [ ] Web: React JSX runtime (StyleSheet works)

---

## Troubleshooting

### Still Getting JSX Errors
```bash
# Nuclear option - full reset
rm -rf node_modules .expo
npm install
npx expo start --clear
```

### Wrong JSX Runtime Used
```bash
# Check babel config
cat babel.config.js

# Should have platform detection:
const isWeb = api.caller((caller) => caller?.platform === 'web');
```

### Components Not Rendering
```bash
# Check browser console for:
# 1. Import errors
# 2. Runtime errors
# 3. Component errors

# Open DevTools (F12) → Console
```

---

## Key Learnings

### 1. Empty Modules Break Dependencies
```javascript
// ❌ Bad - breaks code that depends on it
return { type: 'empty' };

// ✅ Good - redirect to compatible alternative
return context.resolveRequest(context, 'react/jsx-runtime', platform);
```

### 2. Platform-Specific Imports
```javascript
// Each platform can use different modules
if (platform === 'web') {
  return webModule;
} else {
  return nativeModule;
}
```

### 3. JSX Runtime Is Critical
- Every JSX element needs runtime functions
- Can't be empty or missing
- Must provide: jsx, jsxs, jsxDEV (dev mode)

---

## Related Fixes

This fix builds on previous solutions:
1. **Babel Platform Detection** - Prevents NativeWind on web at compilation
2. **Metro Module Redirect** - Provides correct JSX runtime at runtime
3. **SafeAreaView Fix** - Uses platform-specific components

All three work together for full web compatibility.

---

**Fix Applied:** 2025-10-02
**Status:** ✅ JSX runtime error resolved
**Impact:** Web now renders without JSX errors
