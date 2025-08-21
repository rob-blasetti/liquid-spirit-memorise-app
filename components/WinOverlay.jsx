import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../styles/theme';
import ThemedButton from './ThemedButton';
import { playSuccessAnimation } from '../services/animationService';

const WinOverlay = ({ visible, onNextLevel, onHome, gameTitle, difficultyLabel }) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.winOverlay}>
        {/* Frosted background */}
        <BlurView style={StyleSheet.absoluteFillObject} blurType="light" blurAmount={18} />
        {/* Light tint above blur to get a frosted look */}
        <View pointerEvents="none" style={styles.overlayTint} />

        <View style={styles.winContainer}>
        {/* Confetti/sparkle animation behind content */}
        <View pointerEvents="none" style={styles.celebrateWrap}>
          {playSuccessAnimation({ style: styles.celebrateAnim })}
        </View>
        <Text style={styles.winTitle}>Level Completed!</Text>
        {gameTitle ? (
          <Text style={styles.winSubtitle}>You completed {gameTitle}.</Text>
        ) : null}
        {difficultyLabel ? (
          <Text style={styles.difficultyText}>Difficulty: {difficultyLabel}</Text>
        ) : null}
        <View style={styles.actionsRow}>
          <ThemedButton
            title="Home"
            onPress={onHome}
            style={[styles.ctaBtn, styles.homeCta]}
            textStyle={styles.ctaText}
          />
          <ThemedButton
            title="Next Level"
            onPress={onNextLevel}
            style={[styles.ctaBtn, styles.nextCta]}
            textStyle={styles.ctaText}
          />
        </View>
        </View>
      </View>
    </Modal>
  );
};

export default WinOverlay;

const styles = StyleSheet.create({
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  winContainer: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 40,
    alignItems: 'center',
    width: '86%',
    maxWidth: 520,
    minHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  celebrateWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.25,
  },
  celebrateAnim: {
    width: 280,
    height: 280,
  },
  winTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: themeVariables.primaryColor,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  winSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeVariables.blackColor,
    textAlign: 'center',
    marginBottom: 6,
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '700',
    color: themeVariables.secondaryColor,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  ctaBtn: {
    minWidth: 120,
    height: 50,
    paddingHorizontal: 18,
  },
  homeCta: {
    backgroundColor: themeVariables.primaryLightColor,
  },
  nextCta: {
    backgroundColor: themeVariables.primaryColor,
  },
  ctaText: {
    fontWeight: '700',
  },
});
