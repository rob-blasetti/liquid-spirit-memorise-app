import performance, { setResourceLoggingEnabled } from 'react-native-performance';
import {
  initializePerformanceMonitoring,
  markNavigationStart,
  markNavigationComplete,
  markAppInteractive,
  subscribeToPerformanceEvents,
  __unsafeResetPerformanceState,
} from '../src/services/performanceService';

describe('performanceService', () => {
  beforeEach(() => {
    __unsafeResetPerformanceState();
    jest.clearAllMocks();
  });

  it('initializes observers and optional resource logging', () => {
    const listener = jest.fn();
    initializePerformanceMonitoring({ resourceLogging: true, onEvent: listener });
    expect(setResourceLoggingEnabled).toHaveBeenCalledWith(true);

    const unsubscribe = subscribeToPerformanceEvents(listener);
    unsubscribe();
  });

  it('emits navigation events with measurements', () => {
    initializePerformanceMonitoring();
    const listener = jest.fn();
    const unsubscribe = subscribeToPerformanceEvents(listener);

    markNavigationStart('home');
    markNavigationComplete('home', { from: 'splash' });

    const measureCall = performance.measure.mock.calls.find(([name]) =>
      name.startsWith('screen-transition:home'),
    );
    expect(measureCall).toBeDefined();

    expect(performance.metric).toHaveBeenCalledWith(
      'screenTransition',
      expect.objectContaining({
        detail: expect.objectContaining({ screen: 'home', phase: 'end' }),
      }),
    );

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigationComplete',
        screen: 'home',
        detail: expect.objectContaining({ from: 'splash', screen: 'home' }),
      }),
    );

    unsubscribe();
  });

  it('marks app interactive and records startup measures', () => {
    initializePerformanceMonitoring();
    markAppInteractive({ initialScreen: 'home' });

    expect(performance.mark).toHaveBeenCalledWith(
      'appInteractive',
      expect.objectContaining({
        detail: expect.objectContaining({ initialScreen: 'home', phase: 'interactive' }),
      }),
    );

    expect(performance.measure).toHaveBeenCalledWith(
      'appStartup',
      expect.objectContaining({
        start: 'nativeLaunchStart',
        end: 'appInteractive',
      }),
    );

    expect(performance.metric).toHaveBeenCalledWith(
      'appStartup',
      expect.objectContaining({
        detail: expect.objectContaining({ label: 'Native Launch → Interactive' }),
      }),
    );
  });
});
