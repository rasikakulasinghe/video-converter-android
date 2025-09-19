# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }

# React Native Image Picker
-keep class com.imagepicker.** { *; }

# React Native FS
-keep class com.rnfs.** { *; }

# React Native Device Info
-keep class com.learnium.RNDeviceInfo.** { *; }

# React Native AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# React Native Haptic Feedback
-keep class com.mkuczera.** { *; }

# FFmpeg Kit React Native - Critical for video processing
-keep class com.arthenica.ffmpegkit.** { *; }
-keep class com.arthenica.smartexception.** { *; }

# FFmpeg native libraries - Essential for video conversion
-keep class * {
    native <methods>;
}

# Zustand state management
-keep class zustand.** { *; }

# NativeWind/Tailwind CSS
-keep class nativewind.** { *; }

# Keep all classes that have native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes that are used by React Native
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes JavascriptInterface

# For JavaScript interface
-keep class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Serializable implementations
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Video processing specific optimizations
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Remove logging for release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Remove React Native development utilities in release
-assumenosideeffects class com.facebook.react.common.ReactConstants {
    public static boolean DEBUG;
}

# Keep crash reporting
-keep public class * extends java.lang.Exception
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.ExecutorToken { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor { *; }
-keep class com.facebook.react.bridge.ModuleRegistryHolder { *; }
-keep class com.facebook.react.bridge.ReadableType { *; }
-keep class com.facebook.react.bridge.queue.NativeRunnable { *; }
