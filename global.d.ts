// Global type declarations for React Native and Expo
/// <reference types="react-native" />
/// <reference types="expo" />

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  const value: any;
  export = value;
}

declare module '*.json' {
  const value: any;
  export = value;
}

// Fix for React Native module exports
declare module 'react-native' {
  export * from 'react-native/Libraries/ReactNative/ReactNative';
}

// Global type for Jest environment
declare var global: NodeJS.Global;