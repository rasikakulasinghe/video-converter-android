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