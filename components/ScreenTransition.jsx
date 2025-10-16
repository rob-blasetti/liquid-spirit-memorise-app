import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  pane: {
    ...StyleSheet.absoluteFillObject,
  },
});

const ScreenTransition = ({
  transitionState,
  transitionProgress,
  viewportWidth,
  renderScreenForNav,
}) => {
  if (!ScreenTransition.canAnimate({ transitionState, viewportWidth })) {
    return <View style={styles.stack}>{renderScreenForNav(transitionState?.to)}</View>;
  }

  const { from, to, direction } = transitionState;
  const fromTranslateX = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'forward' ? [0, -viewportWidth] : [0, viewportWidth],
  });
  const toTranslateX = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'forward' ? [viewportWidth, 0] : [-viewportWidth, 0],
  });

  return (
    <View style={styles.stack}>
      <Animated.View
        pointerEvents="none"
        style={[styles.pane, { transform: [{ translateX: fromTranslateX }] }]}
      >
        {renderScreenForNav(from)}
      </Animated.View>
      <Animated.View
        pointerEvents="auto"
        style={[styles.pane, { transform: [{ translateX: toTranslateX }] }]}
      >
        {renderScreenForNav(to)}
      </Animated.View>
    </View>
  );
};

ScreenTransition.canAnimate = ({ transitionState, viewportWidth }) =>
  Boolean(
    transitionState
    && transitionState.from
    && transitionState.to
    && typeof viewportWidth === 'number'
    && viewportWidth > 0,
  );

export default ScreenTransition;
