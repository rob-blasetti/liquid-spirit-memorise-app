const preset = require('react-native/jest-preset');

module.exports = {
  ...preset,
  watchman: false,
  setupFiles: ['<rootDir>/jest.globals.js'],
  transform: {
    ...preset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Transform these modules by Babel
    // Transform these external modules by Babel
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation.*|react-native-tts|react-native-linear-gradient|react-native-vector-icons|@fortawesome/react-native-fontawesome|react-native-image-picker|@liquidspirit/react-native-boring-avatars|react-native-tab-view)/)',
  ],
};
