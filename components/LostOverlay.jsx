import React from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../styles/theme';
import ThemedButton from './ThemedButton';

const LostOverlay = ({ visible, gameTitle, difficultyLabel, onRetry, onHome }) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <BlurView style={StyleSheet.absoluteFillObject} blurType="light" blurAmount={22} />
        <LinearGradient
          colors={['rgba(26, 20, 51, 0.42)', 'rgba(12, 10, 24, 0.64)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlayTint}
          pointerEvents="none"
        />

        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.66)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          />
          <View style={styles.container}>
            <View pointerEvents="none" style={styles.decorWrap}>
              <Animated.View style={[styles.decorCircle, styles.decorCirclePrimary]} />
              <Animated.View style={[styles.decorCircle, styles.decorCircleSecondary]} />
              <View style={styles.topGlow} />
            </View>

            <Text style={styles.title}>Let’s Keep Going</Text>
            {gameTitle ? (
              <Text style={styles.subtitle}>Try {gameTitle} again.</Text>
            ) : (
              <Text style={styles.subtitle}>You’re close—give it another go.</Text>
            )}
            {difficultyLabel ? (
              <Text style={styles.difficulty}>Difficulty: {difficultyLabel}</Text>
            ) : null}
            <View style={styles.divider} />
            <View style={styles.actionsRow}>
              {onHome ? (
                <ThemedButton
                  title="Home"
                  onPress={onHome}
                  style={[styles.ctaBtn, styles.homeCta]}
                  textStyle={styles.ctaText}
                />
              ) : (
                <View style={styles.spacer} />
              )}
              <ThemedButton
                title="Try Again"
                onPress={onRetry}
                style={[styles.ctaBtn, styles.retryCta]}
                textStyle={styles.ctaText}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LostOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  overlayTint: {
    ...StyleSheet.absoluteFillObject,
  },
  cardWrapper: {
    width: '90%',
    maxWidth: 540,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  gradientBorder: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  container: {
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  decorWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  decorCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.18,
  },
  decorCirclePrimary: {
    top: -90,
    backgroundColor: themeVariables.primaryColor,
  },
  decorCircleSecondary: {
    top: -40,
    backgroundColor: themeVariables.tertiaryDarkColor,
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    width: 280,
    height: 120,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    color: themeVariables.whiteColor,
    textAlign: 'center',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 8,
  },
  difficulty: {
    fontSize: 16,
    fontWeight: '700',
    color: themeVariables.secondaryLightColor,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.6,
  },
  divider: {
    width: '82%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  ctaBtn: {
    minWidth: 118,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  retryCta: {
    backgroundColor: themeVariables.primaryColor,
  },
  homeCta: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  ctaText: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  spacer: {
    width: 140,
  },
});
