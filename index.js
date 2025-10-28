import { AppRegistry } from 'react-native';
import App from './src/app';
import {
  initializePerformanceMonitoring,
  subscribeToPerformanceEvents,
} from './src/services/performanceService';
import { name as appName } from './app.json';

initializePerformanceMonitoring();

if (__DEV__) {
  const formatDuration = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value.toFixed(1)}ms`;
    }
    return 'n/a';
  };

  const navStats = new Map();

  const globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : // eslint-disable-next-line no-undef
        typeof global !== 'undefined'
        ? // eslint-disable-next-line no-undef
          global
        : undefined;

  const updateRouteStats = ({ from, screen, duration, animated }) => {
    const routeKey = `${from ?? '∅'} → ${screen}`;
    const existing = navStats.get(routeKey);
    const next = existing
      ? {
          ...existing,
          count: existing.count + 1,
          totalDuration: existing.totalDuration + duration,
          maxDuration: Math.max(existing.maxDuration, duration),
          lastDuration: duration,
          animatedCount: existing.animatedCount + (animated ? 1 : 0),
        }
      : {
          count: 1,
          totalDuration: duration,
          maxDuration: duration,
          lastDuration: duration,
          animatedCount: animated ? 1 : 0,
        };
    navStats.set(routeKey, next);
  };

  const printRouteSummary = () => {
    const rows = Array.from(navStats.entries()).map(([route, stats]) => ({
      route,
      count: stats.count,
      avg: formatDuration(stats.totalDuration / stats.count),
      last: formatDuration(stats.lastDuration),
      max: formatDuration(stats.maxDuration),
      animatedRate: `${Math.round((stats.animatedCount / stats.count) * 100) || 0}%`,
    }));
    if (!rows.length) {
      console.log('[perf] No navigation metrics recorded yet.');
      return;
    }
    console.table(rows);
  };

  const resetRouteSummary = () => {
    navStats.clear();
    console.log('[perf] Navigation summary reset.');
  };

  if (globalObject) {
    Object.assign(globalObject, {
      __printPerfSummary: printRouteSummary,
      __resetPerfSummary: resetRouteSummary,
    });
  }

  subscribeToPerformanceEvents((event) => {
    if (!event || typeof event !== 'object') return;
    const { type } = event;

    switch (type) {
      case 'navigationStart': {
        const { screen, detail } = event;
        const fromScreen = detail?.from ?? null;
        if (fromScreen === screen) return;
        console.log('[perf][nav:start]', `${fromScreen ?? '∅'} → ${screen}`, detail);
        break;
      }
      case 'navigationComplete': {
        const { screen, detail, measure } = event;
        if (!measure) return;
        const fromScreen = detail?.from ?? null;
        updateRouteStats({
          from: fromScreen,
          screen,
          duration: measure.duration,
          animated: detail?.animated,
        });
        console.log(
          '[perf][nav:done]',
          `${fromScreen ?? '∅'} → ${screen}`,
          `${formatDuration(measure.duration)}${
            measure.duration >= 500 ? ' ⚠️ slow' : ''
          }`,
          detail,
        );
        break;
      }
      case 'measure': {
        const { name, entry } = event;
        if (typeof name === 'string' && name.startsWith('screen-transition:')) {
          return;
        }
        console.log('[perf][measure]', name, {
          duration: entry?.duration ?? null,
          startTime: entry?.startTime ?? null,
        });
        break;
      }
      case 'nativeMark': {
        const entries = Array.isArray(event.entries) ? event.entries : [];
        if (entries.length > 0) {
          console.log(
            '[perf][native]',
            entries.map((entry) => ({
              name: entry.name,
              startTime: entry.startTime,
            })),
          );
        }
        break;
      }
      default:
        console.log('[perf]', event);
    }
  });
}

AppRegistry.registerComponent(appName, () => App);
