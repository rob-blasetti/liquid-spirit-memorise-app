import React, { forwardRef, useImperativeHandle } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

const mockMarkNavigationStart = jest.fn();
const mockPrefetchGame = jest.fn();

jest.mock('../src/services/performanceService', () => ({
  markNavigationStart: (...args) => mockMarkNavigationStart(...args),
}));

jest.mock('../src/screens/profile/HomeScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../src/screens/profile/SettingsScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../src/games/lazyGameRoutes', () => ({
  lazyGameScreens: {
    testGame: () => null,
  },
  prefetchGame: (...args) => mockPrefetchGame(...args),
}));

const useNavigationHandlers = require('../src/hooks/useNavigationHandlers').default;

const HookHarness = forwardRef((_props, ref) => {
  const value = useNavigationHandlers();
  useImperativeHandle(ref, () => value, [value]);
  return null;
});

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useNavigationHandlers', () => {
  beforeEach(() => {
    mockMarkNavigationStart.mockClear();
    mockPrefetchGame.mockReset();
  });

  it('preloads app routes before committing navigation state', async () => {
    const ref = React.createRef();

    await act(async () => {
      ReactTestRenderer.create(<HookHarness ref={ref} />);
    });

    await act(async () => {
      ref.current.goTo('settings');
    });
    await flushMicrotasks();

    expect(ref.current.nav.screen).toBe('settings');
    expect(mockMarkNavigationStart).toHaveBeenCalledWith('settings', { from: 'home' });
  });

  it('keeps the latest navigation request when an older preload finishes later', async () => {
    let resolveFirstNavigation;
    mockPrefetchGame.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstNavigation = resolve;
        }),
    );

    const ref = React.createRef();

    await act(async () => {
      ReactTestRenderer.create(<HookHarness ref={ref} />);
    });

    await act(async () => {
      ref.current.goTo('testGame');
      ref.current.goTo('settings');
    });
    await flushMicrotasks();

    expect(mockPrefetchGame).toHaveBeenCalledWith('testGame');
    expect(ref.current.nav.screen).toBe('settings');

    await act(async () => {
      resolveFirstNavigation?.(null);
      await Promise.resolve();
    });

    expect(ref.current.nav.screen).toBe('settings');
  });
});
