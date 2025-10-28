import performance, {
  PerformanceObserver,
  setResourceLoggingEnabled,
} from 'react-native-performance';

const SCREEN_TRANSITION_PREFIX = 'screen-transition';
const APP_INTERACTIVE_MARK = 'appInteractive';

let navigationCounter = 0;
let markObserver = null;
let isInitialized = false;

const activeTransitions = new Map();
const listeners = new Set();

const emitEvent = (event) => {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      // Ignore listener failures to avoid cascading errors.
    }
  });
};

const safeMark = (name, options) => {
  if (!performance || typeof performance.mark !== 'function') return null;
  try {
    return performance.mark(name, options);
  } catch (error) {
    return null;
  }
};

const safeMeasure = (name, optionsOrStart, endMark, extraEvent = {}) => {
  if (!performance || typeof performance.measure !== 'function') return null;

  try {
    const entry =
      typeof optionsOrStart === 'object'
        ? performance.measure(name, optionsOrStart)
        : performance.measure(name, optionsOrStart, endMark);

    if (entry) {
      emitEvent({ type: 'measure', name, entry, ...extraEvent });
    }

    return entry;
  } catch (error) {
    return null;
  }
};

const safeMetric = (name, options) => {
  if (!performance || typeof performance.metric !== 'function') return null;
  try {
    return performance.metric(name, options);
  } catch (error) {
    return null;
  }
};

const recordStartupMeasures = (markNames) => {
  if (markNames.has('nativeLaunchEnd')) {
    const entry = safeMeasure(
      'nativeLaunch',
      {
        start: 'nativeLaunchStart',
        end: 'nativeLaunchEnd',
        detail: { phase: 'startup', label: 'Native Launch' },
      },
      undefined,
      { category: 'startup' },
    );
    if (entry) {
      safeMetric('nativeLaunch', {
        value: entry.duration,
        startTime: entry.startTime,
        detail: entry.detail,
      });
    }
  }

  if (markNames.has('runJsBundleEnd')) {
    const entry = safeMeasure(
      'jsBundleExecution',
      {
        start: 'runJsBundleStart',
        end: 'runJsBundleEnd',
        detail: { phase: 'startup', label: 'Run JS Bundle' },
      },
      undefined,
      { category: 'startup' },
    );
    if (entry) {
      safeMetric('jsBundleExecution', {
        value: entry.duration,
        startTime: entry.startTime,
        detail: entry.detail,
      });
    }
  }
};

const ensureObserver = () => {
  if (markObserver || typeof PerformanceObserver !== 'function') return;

  try {
    markObserver = new PerformanceObserver((list) => {
      const entries = list?.getEntries?.() || [];
      if (!entries.length) return;

      const names = new Set(entries.map((entry) => entry.name));
      recordStartupMeasures(names);

      emitEvent({ type: 'nativeMark', entries });
    });
    markObserver.observe({ type: 'react-native-mark', buffered: true });
  } catch (error) {
    markObserver = null;
  }
};

const registerGlobalPerformance = () => {
  const globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : // eslint-disable-next-line no-undef
        typeof global !== 'undefined'
        ? // eslint-disable-next-line no-undef
          global
        : undefined;

  if (globalObject && !globalObject.performance) {
    globalObject.performance = performance;
  }
};

export const initializePerformanceMonitoring = ({
  resourceLogging = false,
  onEvent,
} = {}) => {
  if (isInitialized) {
    if (typeof onEvent === 'function') {
      listeners.add(onEvent);
    }
    return;
  }

  registerGlobalPerformance();

  if (resourceLogging) {
    setResourceLoggingEnabled(true);
  }

  if (typeof onEvent === 'function') {
    listeners.add(onEvent);
  }

  ensureObserver();

  isInitialized = true;
};

export const subscribeToPerformanceEvents = (listener) => {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getTransitionKey = (screenName) => `${screenName}:${navigationCounter}`;

export const markNavigationStart = (screenName, detail = {}) => {
  if (!screenName) return null;
  navigationCounter += 1;

  const key = getTransitionKey(screenName);
  const startMark = `${SCREEN_TRANSITION_PREFIX}:${key}:start`;
  const markDetail = { ...detail, screen: screenName, phase: 'start' };

  const markEntry = safeMark(startMark, { detail: markDetail });

  const existing = activeTransitions.get(screenName);
  if (existing && existing.startMark && existing.startMark !== startMark) {
    performance.clearMarks(existing.startMark);
  }

  activeTransitions.set(screenName, {
    id: key,
    startMark,
    detail: markDetail,
  });

  emitEvent({
    type: 'navigationStart',
    screen: screenName,
    detail: markDetail,
    mark: markEntry,
  });

  return key;
};

export const markNavigationComplete = (screenName, detail = {}) => {
  if (!screenName) return null;

  const transition = activeTransitions.get(screenName);
  const key = transition?.id || getTransitionKey(screenName);
  const endMark = `${SCREEN_TRANSITION_PREFIX}:${key}:end`;
  const markDetail = {
    ...detail,
    screen: screenName,
    phase: 'end',
  };

  const endEntry = safeMark(endMark, { detail: markDetail });
  let measureEntry = null;

  if (transition?.startMark) {
    const measureName = `${SCREEN_TRANSITION_PREFIX}:${key}`;
    measureEntry = safeMeasure(
      measureName,
      {
        start: transition.startMark,
        end: endMark,
        detail: { ...transition.detail, ...markDetail },
      },
      undefined,
      { category: 'navigation' },
    );

    if (measureEntry) {
      safeMetric('screenTransition', {
        value: measureEntry.duration,
        startTime: measureEntry.startTime,
        detail: measureEntry.detail,
      });
    }

    performance.clearMarks(transition.startMark);
    activeTransitions.delete(screenName);
  }

  performance.clearMarks(endMark);

  emitEvent({
    type: 'navigationComplete',
    screen: screenName,
    detail: markDetail,
    mark: endEntry,
    measure: measureEntry,
  });

  return measureEntry;
};

export const markAppInteractive = (detail = {}) => {
  const markDetail = { ...detail, phase: 'interactive' };
  safeMark(APP_INTERACTIVE_MARK, { detail: markDetail });

  const startupEntry = safeMeasure(
    'appStartup',
    {
      start: 'nativeLaunchStart',
      end: APP_INTERACTIVE_MARK,
      detail: { ...markDetail, label: 'Native Launch → Interactive' },
    },
    undefined,
    { category: 'startup' },
  );

  if (startupEntry) {
    safeMetric('appStartup', {
      value: startupEntry.duration,
      startTime: startupEntry.startTime,
      detail: startupEntry.detail,
    });
  }

  const bundleEntry = safeMeasure(
    'bundleToInteractive',
    {
      start: 'runJsBundleEnd',
      end: APP_INTERACTIVE_MARK,
      detail: { ...markDetail, label: 'JS Bundle → Interactive' },
    },
    undefined,
    { category: 'startup' },
  );

  if (bundleEntry) {
    safeMetric('appInteractive', {
      value: bundleEntry.duration,
      startTime: bundleEntry.startTime,
      detail: bundleEntry.detail,
    });
  }
};

export const __unsafeResetPerformanceState = () => {
  activeTransitions.clear();
  listeners.clear();
  navigationCounter = 0;

  if (markObserver && typeof markObserver.disconnect === 'function') {
    try {
      markObserver.disconnect();
    } catch (error) {
      // ignore
    }
  }

  markObserver = null;
  isInitialized = false;
};
