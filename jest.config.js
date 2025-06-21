const preset = require('react-native/jest-preset');

module.exports = {
  ...preset,
  transform: {
    ...preset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Transform these modules by Babel
    // Transform these external modules by Babel
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-vector-icons|@fortawesome/react-native-fontawesome|react-native-image-picker|@flipxyz/react-native-boring-avatars)/)',
  ],
};
