import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';

const ScreenBackground = ({ children, style }) => {
  if (process.env.NODE_ENV === 'test') {
    return <View style={[styles.testBackground, style]}>{children}</View>;
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={[themeVariables.gradientStart, themeVariables.gradientEnd]}
      style={[styles.background, style]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  testBackground: {
    flex: 1,
    backgroundColor: themeVariables.gradientStart,
  },
});

export default ScreenBackground;
