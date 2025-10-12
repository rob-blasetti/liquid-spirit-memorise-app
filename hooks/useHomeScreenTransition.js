import { useRef, useState, useEffect } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';

const SCREEN_SLIDE_DURATION = 280;

const isHomeScreen = (screenName) => screenName === 'home';

const shouldAnimateHomeTransition = (fromNav, toNav) => {
  if (!fromNav || !toNav) return false;
  const fromHome = isHomeScreen(fromNav.screen);
  const toHome = isHomeScreen(toNav.screen);
  // Animate leaving home or returning to home
  return fromHome !== toHome;
};

const getDirection = (fromNav, toNav) => {
  if (isHomeScreen(fromNav.screen) && !isHomeScreen(toNav.screen)) {
    return 'forward';
  }
  return 'backward';
};

const useHomeScreenTransition = (nav) => {
  const { width } = useWindowDimensions();
  const transitionProgressRef = useRef(new Animated.Value(0));
  const transitionProgress = transitionProgressRef.current;
  const [transitionState, setTransitionState] = useState(null);
  const [displayNav, setDisplayNav] = useState(nav);
  const settledNavRef = useRef(nav);
  const animationRef = useRef(null);

  useEffect(() => {
    const lastSettledNav = settledNavRef.current;
    const nextNav = nav;

    if (!nextNav) return undefined;

    const sameScreen = lastSettledNav?.screen === nextNav.screen;
    if (sameScreen) {
      settledNavRef.current = nextNav;
      setDisplayNav(nextNav);
      setTransitionState(null);
      animationRef.current?.stop();
      animationRef.current = null;
      transitionProgress.setValue(0);
      return undefined;
    }

    const shouldAnimate = shouldAnimateHomeTransition(lastSettledNav, nextNav);
    if (!shouldAnimate) {
      animationRef.current?.stop();
      animationRef.current = null;
      transitionProgress.setValue(0);
      setTransitionState(null);
      settledNavRef.current = nextNav;
      setDisplayNav(nextNav);
      return undefined;
    }

    animationRef.current?.stop();
    animationRef.current = null;
    transitionProgress.setValue(0);

    const direction = getDirection(lastSettledNav, nextNav);
    setTransitionState({ from: lastSettledNav, to: nextNav, direction });

    const animation = Animated.timing(transitionProgress, {
      toValue: 1,
      duration: SCREEN_SLIDE_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished) {
        settledNavRef.current = nextNav;
        setDisplayNav(nextNav);
      }
      setTransitionState(null);
      animationRef.current = null;
    });

    return () => {
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [nav, transitionProgress]);

  useEffect(() => () => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  return {
    displayNav,
    transitionState,
    transitionProgress,
    viewportWidth: width,
  };
};

export default useHomeScreenTransition;
