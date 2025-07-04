import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import themeVariables from '../styles/theme';

/**
 * RewardBanner
 * Displays a full-screen overlay with a "Great Job!" banner animation.
 * Props:
 *   text: optional custom message (default: "Great Job!")
 *   onAnimationEnd: callback when animation completes
 */
const RewardBanner = ({ text = 'Great Job!', onAnimationEnd }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // spring animation from 0 to 1 scale
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start(() => {
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    });
  }, [scaleAnim, onAnimationEnd]);

  return (
    <Pressable style={styles.overlay} onPress={() => onAnimationEnd && onAnimationEnd()}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.banner, { transform: [{ scale: scaleAnim }] }]}>  
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    elevation: 1000,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: themeVariables.borderRadiusJumbo,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    fontSize: 32,
    color: themeVariables.whiteColor,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RewardBanner;