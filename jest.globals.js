// Jest global setup shared across tests
if (typeof global.fetch !== 'function') {
  global.fetch = jest.fn(() => Promise.reject(new Error('fetch not mocked')));
}

if (typeof global.requestAnimationFrame !== 'function') {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}

if (typeof global.cancelAnimationFrame !== 'function') {
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}

if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = false;
}

if (typeof global.IS_REACT_ACT_ENVIRONMENT === 'undefined') {
  global.IS_REACT_ACT_ENVIRONMENT = true;
}

if (typeof global.__fbBatchedBridgeConfig === 'undefined') {
  global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}
