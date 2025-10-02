const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver to handle nativewind on web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Redirect nativewind JSX runtime to react on web
    if (platform === 'web') {
      if (moduleName === 'nativewind/jsx-dev-runtime') {
        return context.resolveRequest(context, 'react/jsx-dev-runtime', platform);
      }
      if (moduleName === 'nativewind/jsx-runtime') {
        return context.resolveRequest(context, 'react/jsx-runtime', platform);
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;