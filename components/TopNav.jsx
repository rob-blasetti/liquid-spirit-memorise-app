import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';

const BUTTON_SIZE = 40;
const ICON_SIZE = 22;
const defaultHitSlop = { top: 10, right: 10, bottom: 10, left: 10 };

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
    <View style={[styles.container, containerStyle]}>
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
