import React from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../stylesheets/theme';
import ThemedButton from './ThemedButton';

const LostOverlay = ({ visible, gameTitle, difficultyLabel, onRetry, onHome }) => {
  const resolvedGameTitle = gameTitle || 'This Game';
  const resolvedDifficulty = difficultyLabel || 'Current Level';

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
          <BlurView
            style={styles.cardBlur}
            blurType="light"
            blurAmount={24}
            reducedTransparencyFallbackColor="rgba(30,28,56,0.35)"
          />
          <View pointerEvents="none" style={styles.cardTint} />
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(255,255,255,0.5)',
              'rgba(255,255,255,0.18)',
              'rgba(255,255,255,0.08)',
              'rgba(255,255,255,0)',
            ]}
            locations={[0, 0.35, 0.7, 1]}
            style={styles.cardGloss}
          />
          <View style={styles.container}>
            <View pointerEvents="none" style={styles.decorWrap}>
              <Animated.View style={[styles.decorArc, styles.decorArcPrimary]} />
              <Animated.View style={[styles.decorArc, styles.decorArcSecondary]} />
            </View>

            <Text style={styles.title}>Let's Try Again</Text>
            <Text style={styles.subtitle}>Take a breather and get ready for another round.</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Game</Text>
                <Text style={styles.summaryValue}>{resolvedGameTitle}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Difficulty</Text>
                <View style={styles.difficultyChip}>
                  <Text style={styles.difficultyChipText}>{resolvedDifficulty}</Text>
                </View>
              </View>
            </View>
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
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#0E1635',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 36,
    elevation: 18,
  },
  cardBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,26,52,0.22)',
  },
  cardGloss: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    paddingVertical: 34,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  decorWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  decorArc: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  decorArcPrimary: {
    transform: [{ scale: 1.05 }],
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorArcSecondary: {
    transform: [{ scale: 0.72 }],
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    color: themeVariables.whiteColor,
    textAlign: 'center',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(15,32,67,0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 26,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginBottom: 26,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginVertical: 16,
  },
  difficultyChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    shadowColor: 'rgba(14,32,67,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  difficultyChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: themeVariables.whiteColor,
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
