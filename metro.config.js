const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  // Enable CSS support for NativeWind
  isCSSEnabled: true,
});

module.exports = config;