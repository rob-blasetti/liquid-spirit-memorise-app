import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  I18nManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const BUTTON_SIZE = 40;
const ICON_SIZE = 22;
const defaultHitSlop = { top: 10, right: 10, bottom: 10, left: 10 };
const SWIPE_EDGE_WIDTH = 40;
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_MIN_ACTIVATION_DISTANCE = 12;
const SWIPE_MAX_VERTICAL_DELTA = 48;
const SWIPE_MIN_VELOCITY = 0.35;

const TopNav = ({
  title,
  children,
  onBack,
  leftAccessory,
  rightAccessory,
  backAccessibilityLabel = 'Go back',
  backIconColor = themeVariables.whiteColor,
  backIconSize = ICON_SIZE,
  containerStyle,
  titleStyle,
  preserveLeftPlaceholder = true,
  preserveRightPlaceholder = true,
  buttonStyle,
  hitSlop = defaultHitSlop,
}) => {
  const swipeResponder = useMemo(() => {
    if (typeof onBack !== 'function') {
      return null;
    }

    const { width: screenWidth = 0 } = Dimensions.get('window') || {};
    const edgeActivationWidth = Math.max(
      SWIPE_EDGE_WIDTH,
      Math.min(80, screenWidth * 0.12 || 0),
    );

    const isRtl = Boolean(I18nManager?.isRTL);
    const shouldClaimGesture = (gestureState) => {
      if (!gestureState) return false;
      const { dx, dy, x0 } = gestureState;
      const horizontalDelta = isRtl ? -dx : dx;
      if (horizontalDelta <= SWIPE_MIN_ACTIVATION_DISTANCE) return false;
      if (Math.abs(dy) > SWIPE_MAX_VERTICAL_DELTA) return false;
      if (screenWidth > 0) {
        const distanceFromEdge = isRtl ? screenWidth - x0 : x0;
        if (distanceFromEdge > edgeActivationWidth) {
          return false;
        }
      } else if (x0 > edgeActivationWidth) {
        return false;
      }
      return true;
    };

    const shouldCompleteSwipe = (gestureState) => {
      if (!gestureState) return false;
      const { dx, dy, vx } = gestureState;
      const horizontalDelta = isRtl ? -dx : dx;
      const horizontalVelocity = isRtl ? -vx : vx;
      if (horizontalDelta <= 0) return false;
      if (Math.abs(dy) > SWIPE_MAX_VERTICAL_DELTA) return false;
      return (
        horizontalDelta >= SWIPE_DISTANCE_THRESHOLD
        || horizontalVelocity >= SWIPE_MIN_VELOCITY
      );
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => shouldClaimGesture(gestureState),
      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => shouldClaimGesture(gestureState),
      onPanResponderRelease: (_evt, gestureState) => {
        if (shouldCompleteSwipe(gestureState)) {
          onBack();
        }
      },
      onPanResponderTerminate: (_evt, gestureState) => {
        if (shouldCompleteSwipe(gestureState)) {
          onBack();
        }
      },
      onPanResponderTerminationRequest: () => true,
    });
  }, [onBack]);

  const renderBackButton = () => (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel={backAccessibilityLabel}
      hitSlop={hitSlop}
      activeOpacity={0.85}
    >
      <Ionicons name="chevron-back" size={backIconSize} color={backIconColor} />
    </TouchableOpacity>
  );

  const left = (() => {
    if (leftAccessory) {
      return leftAccessory;
    }
    if (typeof onBack === 'function') {
      return renderBackButton();
    }
    if (preserveLeftPlaceholder) {
      return <View style={styles.placeholder} />;
    }
    return null;
  })();

  const right = (() => {
    if (rightAccessory) {
      return rightAccessory;
    }
    if (preserveRightPlaceholder) {
      return <View style={styles.placeholder} />;
    }
    return null;
  })();

  const centerContent =
    children ||
    (typeof title === 'string' || typeof title === 'number' ? (
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>
    ) : (
      title || null
    ));

  return (
    <View
      style={[styles.container, containerStyle]}
      {...(swipeResponder?.panHandlers ?? {})}
    >
      {left}
      <View style={styles.center}>{centerContent}</View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: BUTTON_SIZE,
  },
  title: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: '600',
    color: themeVariables.whiteColor,
    textAlign: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
  },
  placeholder: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
});

export const TOP_NAV_BUTTON_SIZE = BUTTON_SIZE;

export default TopNav;
