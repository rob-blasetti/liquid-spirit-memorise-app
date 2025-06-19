const preset = require('react-native/jest-preset');

module.exports = {
  ...preset,
  transform: {
    ...preset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-vector-icons)/)',
  ],
};
