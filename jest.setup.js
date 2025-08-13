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
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-config', () => ({
  DEV_API: 'http://localhost:3000',
  STAGING_API: 'http://localhost:3000',
  PROD_API: 'http://localhost:3000',
}));

// Basic AsyncStorage mock for tests
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
      return Promise.resolve();
    }),
    getItem: jest.fn((key) => Promise.resolve(store[key] ?? null)),
    removeItem: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn((keys) => Promise.resolve(keys.map(k => [k, store[k] ?? null]))),
    clear: jest.fn(() => { store = {}; return Promise.resolve(); }),
  };
});

// Silence noisy logs in tests
beforeAll(() => {
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

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
