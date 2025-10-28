import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../stylesheets/theme';

const Chip = ({
  icon,
  text,
  color = theme.whiteColor,
  bg = 'rgba(255,255,255,0.15)',
  style,
  textStyle,
  iconStyle,
  iconSize = 14,
  onPress,
  disabled = false,
  accessibilityLabel,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? {
        activeOpacity: 0.8,
        onPress,
        disabled,
        accessibilityRole: 'button',
        accessibilityLabel: accessibilityLabel || text,
        hitSlop: { top: 8, right: 8, bottom: 8, left: 8 },
        ...(disabled ? { accessibilityState: { disabled: true } } : {}),
      }
    : {};

  return (
    <Container style={[styles.chip, { backgroundColor: bg }, style]} {...containerProps}>
      {icon ? (
        <Ionicons
          name={icon}
          size={iconSize}
          color={color}
          style={[styles.icon, iconStyle]}
        />
      ) : null}
      <Text style={[styles.text, { color }, textStyle]} numberOfLines={1}>
        {text}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Chip;
