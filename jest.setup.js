jest.mock('liquid-spirit-styleguide', () => {
  const React = require('react');
  const MockButton = ({ label, onPress }) => React.createElement('Button', { label, onPress });
  return { Button: MockButton };
});
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => React.createElement('NavigationContainer', null, children),
  };
});
jest.mock('@react-navigation/stack', () => {
  return {
    createStackNavigator: jest.fn(() => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    })),
  };
});
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-tts', () => ({
  addEventListener: jest.fn(),
  getInitStatus: jest.fn(() => Promise.resolve()),
  speak: jest.fn(),
  stop: jest.fn(),
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  setGenericPassword: jest.fn(() => Promise.resolve()),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
}), { virtual: true });
