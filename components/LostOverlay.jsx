import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import themeVariables from '../styles/theme';
import ThemedButton from './ThemedButton';

const LostOverlay = ({ visible, gameTitle, difficultyLabel, onRetry, onHome }) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <BlurView style={StyleSheet.absoluteFillObject} blurType="light" blurAmount={18} />
        <View pointerEvents="none" style={styles.overlayTint} />

        <View style={styles.container}>
          <Text style={styles.title}>Nice Try!</Text>
          {gameTitle ? (
            <Text style={styles.subtitle}>Let's try {gameTitle} again.</Text>
          ) : (
            <Text style={styles.subtitle}>Give it another go.</Text>
          )}
          {difficultyLabel ? (
            <Text style={styles.difficulty}>Difficulty: {difficultyLabel}</Text>
          ) : null}
          <View style={styles.actionsRow}>
            {onHome ? (
              <ThemedButton title="Home" onPress={onHome} style={[styles.ctaBtn, styles.homeCta]} textStyle={styles.ctaText} />
            ) : <View />}
            <ThemedButton title="Try Again" onPress={onRetry} style={[styles.ctaBtn, styles.retryCta]} textStyle={styles.ctaText} />
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
    zIndex: 1000,
  },
  overlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 40,
    alignItems: 'center',
    width: '86%',
    maxWidth: 520,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    color: themeVariables.redColor,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: themeVariables.blackColor,
    textAlign: 'center',
    marginBottom: 6,
  },
  difficulty: {
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
    width: '100%',
    marginTop: 8,
  },
  ctaBtn: {
    minWidth: 140,
    height: 50,
    paddingHorizontal: 18,
  },
  retryCta: {
    backgroundColor: themeVariables.primaryColor,
  },
  homeCta: {
    backgroundColor: themeVariables.primaryLightColor,
  },
  ctaText: {
    fontWeight: '700',
  },
});
