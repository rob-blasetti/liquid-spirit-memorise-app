import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import themeVariables from '../styles/theme';

const ThemedButton = ({ title, onPress, disabled, style, textStyle }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.button,
      disabled ? styles.disabledButton : {},
      style,
    ]}
  >
    <Text style={[styles.text, disabled ? styles.disabledText : {}, textStyle]}> 
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: themeVariables.buttonDisabledBg,
  },
  disabledText: {
    color: themeVariables.buttonDisabledText,
  },
});

export default ThemedButton;