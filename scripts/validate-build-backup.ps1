# Video Converter Android - Build Validation Script
# Run this script to validate the build configuration

Write-Host "=== Video Converter Android Build Validation ===" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Android SDK is available
Write-Host "1. Checking Android SDK..." -ForegroundColor Yellow
if (-not $env:ANDROID_HOME) {
    Write-Host "   Warning: ANDROID_HOME environment variable not set" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
}

# Check if Java is available
Write-Host "2. Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "   ✓ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Java not found or not in PATH" -ForegroundColor Red
}

# Check Node.js and npm
Write-Host "3. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "   ✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js or npm not found" -ForegroundColor Red
}

# Check if dependencies are installed
Write-Host "4. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host "   ! Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check Android build configuration
Write-Host "5. Checking Android configuration..." -ForegroundColor Yellow
if (Test-Path "android/app/build.gradle") {
    Write-Host "   ✓ Android build.gradle exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ Android build.gradle not found" -ForegroundColor Red
}

if (Test-Path "android/app/proguard-rules.pro") {
    Write-Host "   ✓ ProGuard rules configured" -ForegroundColor Green
} else {
    Write-Host "   ✗ ProGuard rules not found" -ForegroundColor Red
}

# Check keystore configuration
Write-Host "6. Checking keystore configuration..." -ForegroundColor Yellow
if (Test-Path "android/app/debug.keystore") {
    Write-Host "   ✓ Debug keystore exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ Debug keystore not found" -ForegroundColor Red
}

if (Test-Path "android/gradle.properties") {
    $gradleProps = Get-Content "android/gradle.properties" -Raw
    if ($gradleProps -match "MYAPP_UPLOAD_STORE_FILE") {
        Write-Host "   ✓ Release keystore configured" -ForegroundColor Green
    } else {
        Write-Host "   ! Release keystore not configured (using debug for release)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ! gradle.properties not found (will use debug keystore)" -ForegroundColor Yellow
}

# Test TypeScript compilation
Write-Host "7. Testing TypeScript compilation..." -ForegroundColor Yellow
try {
    $tscResult = npm run typecheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "   ✗ TypeScript compilation failed" -ForegroundColor Red
        Write-Host "   $tscResult" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Failed to run TypeScript check" -ForegroundColor Red
}

# Test build process
Write-Host "8. Testing build process..." -ForegroundColor Yellow
Write-Host "   Building debug APK..." -ForegroundColor Yellow

try {
    Set-Location "android"
    $buildResult = ./gradlew.bat assembleDebug 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Debug build successful" -ForegroundColor Green
        
        # Check if APK was created
        if (Test-Path "app/build/outputs/apk/debug/app-debug.apk") {
            $apkSize = (Get-Item "app/build/outputs/apk/debug/app-debug.apk").Length
            $apkSizeMB = [math]::Round($apkSize / 1MB, 2)
            Write-Host "   ✓ APK created: app-debug.apk ($apkSizeMB MB)" -ForegroundColor Green
        } else {
            Write-Host "   ✗ APK file not found after build" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ Debug build failed" -ForegroundColor Red
        Write-Host "   $buildResult" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Build process failed" -ForegroundColor Red
} finally {
    Set-Location ".."
}

# Run tests
Write-Host "9. Running tests..." -ForegroundColor Yellow
try {
    $testResult = npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ All tests passed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Some tests failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Failed to run tests" -ForegroundColor Red
}

# Final summary
Write-Host ""
Write-Host "=== Build Validation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run build:android:release' to create release APK" -ForegroundColor White
Write-Host "2. Test the APK on physical devices" -ForegroundColor White
Write-Host "3. Configure release keystore for production builds" -ForegroundColor White
Write-Host "4. See android/BUILD_GUIDE.md for detailed build instructions" -ForegroundColor White
Write-Host ""