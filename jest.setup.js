jest.mock('liquid-spirit-styleguide', () => {
  const React = require('react');
  const MockButton = ({ label, onPress }) => React.createElement('Button', { label, onPress });
  return { Button: MockButton };
});
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => React.createElement(React.Fragment, null, children),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(),
    }),
  };
});
jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  return {
    createStackNavigator: jest.fn(() => {
      const Navigator = ({ children }) => React.createElement(React.Fragment, null, children);
      const Screen = ({ component: Component, children, name, initialParams }) => {
        const navigation = {
          navigate: jest.fn(),
          goBack: jest.fn(),
          setOptions: jest.fn(),
          addListener: jest.fn(),
        };
        const route = { key: `${name || 'screen'}-key`, name, params: initialParams };
        if (Component) {
          return React.createElement(Component, { navigation, route });
        }
        if (typeof children === 'function') {
          return children({ navigation, route });
        }
        return children ?? null;
      };
      return { Navigator, Screen };
    }),
  };
});
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => {
  const StatusBar = () => null;
  StatusBar.setBarStyle = jest.fn();
  StatusBar.setBackgroundColor = jest.fn();
  StatusBar.setHidden = jest.fn();
  StatusBar.pushStackEntry = jest.fn(() => ({ id: 1 }));
  StatusBar.popStackEntry = jest.fn();
  StatusBar.replaceStackEntry = jest.fn();
  StatusBar.currentHeight = 0;
  return StatusBar;
});
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-config', () => ({
  DEV_API: 'http://localhost:3000',
  STAGING_API: 'http://localhost:3000',
  PROD_API: 'http://localhost:3000',
}));
jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => ({
  API: {
    addAnimatedEventToView: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    createAnimatedNode: jest.fn(),
    dropAnimatedNode: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    restoreDefaultValues: jest.fn(),
    setWaitingForIdentifier: jest.fn(),
    startAnimatingNode: jest.fn(),
    startListeningToAnimatedValue: jest.fn(),
    stopAnimation: jest.fn(),
    stopListeningToAnimatedValue: jest.fn(),
    unsetWaitingForIdentifier: jest.fn(),
    flushQueue: jest.fn(),
  },
  nativeEventEmitter: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeListeners: jest.fn(),
  },
  shouldUseNativeDriver: jest.fn(() => false),
  generateNewAnimationId: jest.fn(() => 1),
  generateNewNodeTag: jest.fn(() => 1),
  transformDataType: jest.fn((value) => value),
  assertNativeAnimatedModule: jest.fn(),
}));
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return class NativeEventEmitter {
    addListener() {
      return { remove: jest.fn() };
    }
    removeListener() {}
    removeAllListeners() {}
  };
});
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: (name) => {
    if (name === 'PlatformConstants') {
      return {
        getConstants: () => ({
          forceTouchAvailable: false,
          interfaceIdiom: 'phone',
          isTesting: true,
          osVersion: '17.0',
          systemName: 'iOS',
          reactNativeVersion: { major: 0, minor: 80, patch: 0 },
        }),
      };
    }

    if (name === 'DeviceInfo') {
      return {
        getConstants: () => ({
          Dimensions: {
            window: { width: 320, height: 568, scale: 2, fontScale: 2 },
            screen: { width: 320, height: 568, scale: 2, fontScale: 2 },
          },
        }),
      };
    }

    return {
      getConstants: () => ({}),
    };
  },
  get: () => null,
}));

// Mock react-native-sound to avoid native dependency in tests
jest.mock('react-native-sound', () => {
  function Sound(path, basePath, onLoad) {
    this._path = path;
    setTimeout(() => onLoad && onLoad(null), 0);
  }
  Sound.prototype.play = function (cb) { setTimeout(() => cb && cb(true), 0); };
  Sound.prototype.stop = function (cb) { setTimeout(() => cb && cb(), 0); };
  Sound.prototype.release = function () {};
  Sound.prototype.setSpeed = function () {};
  return Sound;
});

jest.mock('../vendor/react-native-sound', () => require('react-native-sound'), { virtual: true });

// Mock RNFS to support cache ops in tests
jest.mock('react-native-fs', () => {
  let files = {};
  const join = (...a) => a.join('/').replace(/\\+/g, '/');
  const DocumentDirectoryPath = '/doc';
  const readDir = async (p) => {
    const list = Object.keys(files).filter(k => k.startsWith(p + '/')).map(k => ({
      path: k,
      name: k.split('/').pop(),
      isFile: () => true,
      size: files[k].length,
      mtime: new Date(),
    }));
    return list;
  };
  return {
    DocumentDirectoryPath,
    exists: async (p) => !!Object.keys(files).find(k => k.startsWith(p)),
    mkdir: async () => {},
    writeFile: async (p, data) => { files[p] = data; },
    readDir,
    unlink: async (p) => { delete files[p]; },
    stat: async (p) => ({ size: (files[p] || '').length }),
    touch: async () => {},
  };
});

// Basic AsyncStorage mock for tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Silence noisy logs in tests
beforeAll(() => {
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const originalError = console.error;
  jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) {
      return;
    }
    originalError.call(console, message, ...args);
  });
});

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  setGenericPassword: jest.fn(() => Promise.resolve()),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
}), { virtual: true });
