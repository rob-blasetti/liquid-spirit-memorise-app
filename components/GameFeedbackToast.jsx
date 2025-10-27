import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import themeVariables from '../styles/theme';

const TONE_STYLES = {
  success: {
    backgroundColor: 'rgba(46, 204, 113, 0.95)',
    textColor: themeVariables.whiteColor,
  },
  warning: {
    backgroundColor: 'rgba(255, 159, 67, 0.95)',
    textColor: themeVariables.whiteColor,
  },
  error: {
    backgroundColor: 'rgba(231, 76, 60, 0.96)',
    textColor: themeVariables.whiteColor,
  },
  info: {
    backgroundColor: 'rgba(52, 152, 219, 0.95)',
    textColor: themeVariables.whiteColor,
  },
  neutral: {
    backgroundColor: 'rgba(44, 62, 80, 0.92)',
    textColor: themeVariables.whiteColor,
  },
};

const GameFeedbackToast = ({ feedback, bottomOffset = 120 }) => {
  const [renderedFeedback, setRenderedFeedback] = useState(null);
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedback) {
      setRenderedFeedback(feedback);
      translateY.stopAnimation();
      opacity.stopAnimation();
      translateY.setValue(24);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 14,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (renderedFeedback) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setRenderedFeedback(null);
        }
      });
    }
  }, [feedback, renderedFeedback, opacity, translateY]);

  if (!renderedFeedback) {
    return null;
  }

  const tone = renderedFeedback.tone && TONE_STYLES[renderedFeedback.tone]
    ? renderedFeedback.tone
    : 'warning';
  const toneConfig = TONE_STYLES[tone] || TONE_STYLES.warning;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
          backgroundColor: toneConfig.backgroundColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: toneConfig.textColor }]}>
        {renderedFeedback.text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '86%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2000,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GameFeedbackToast;
