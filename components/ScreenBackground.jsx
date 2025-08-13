import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';

const ScreenBackground = ({ children, style }) => (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    colors={[themeVariables.gradientStart, themeVariables.gradientEnd]}
    style={[styles.background, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default ScreenBackground;
