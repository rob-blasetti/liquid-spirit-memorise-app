import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';
import ThemedButton from '../components/ThemedButton';
import { playCelebrateAnimation, playSuccessAnimation } from '../services/animationService';

const MAX_LEVEL = 3;
const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

const GameVictoryScreen = ({
  gameTitle,
  difficultyLabel,
  level = 1,
  onNextLevel,
  onGoHome,
  onGoGames,
  perfect = false,
  maxLevel = MAX_LEVEL,
}) => {
  const { setLevel } = useDifficulty();
  const normalizedLevel = typeof level === 'number' && level > 0 ? level : 1;
  const hasNextLevel = normalizedLevel < maxLevel;
  const currentDifficulty = useMemo(() => {
    if (difficultyLabel) return difficultyLabel;
    return DIFFICULTY_LABELS[normalizedLevel] || `Level ${normalizedLevel}`;
  }, [difficultyLabel, normalizedLevel]);

  const nextLevelLabel = useMemo(() => {
    const targetLevel = Math.min(normalizedLevel + 1, maxLevel);
    return DIFFICULTY_LABELS[targetLevel] || `Level ${targetLevel}`;
  }, [normalizedLevel, maxLevel]);

  const resolvedGameTitle = gameTitle || 'This Game';

  const handlePrimaryAction = () => {
    if (hasNextLevel) {
      const targetLevel = Math.min(normalizedLevel + 1, maxLevel);
      setLevel(targetLevel);
      onNextLevel?.();
    } else {
      onGoHome?.();
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.container}>
            <View style={styles.animationLayer}>
              <View pointerEvents="none" style={styles.animationBackground}>
                {playCelebrateAnimation({ style: styles.backgroundAnimation })}
              </View>
            <View pointerEvents="none" style={styles.animationForeground}>
              {playSuccessAnimation({ style: styles.foregroundAnimation })}
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.heading}>Victory!</Text>
            <Text style={styles.subHeading}>
              {perfect ? 'Flawless run! ' : ''}
              You conquered
              <Text style={styles.highlight}> {resolvedGameTitle}</Text>.
            </Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Game</Text>
                <Text style={styles.summaryValue}>{resolvedGameTitle}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Difficulty</Text>
                <View style={styles.difficultyChip}>
                  <Text style={styles.difficultyChipText}>{currentDifficulty}</Text>
                </View>
              </View>
            </View>
            <ThemedButton
              title={hasNextLevel ? `Play ${nextLevelLabel}` : 'Back to Home'}
              onPress={handlePrimaryAction}
              style={[styles.primaryCta, !hasNextLevel ? styles.homeCta : null]}
              textStyle={styles.primaryCtaText}
            />
            {onGoGames ? (
              <TouchableOpacity style={styles.secondaryLink} onPress={onGoGames}>
                <Text style={styles.secondaryLinkText}>Choose another game</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default GameVictoryScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: themeVariables.primaryColor,
  },
  safeArea: {
    flex: 1,
    backgroundColor: themeVariables.primaryColor,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  animationLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationBackground: {
    position: 'absolute',
    width: 420,
    height: 420,
    opacity: 0.4,
  },
  backgroundAnimation: {
    width: '100%',
    height: '100%',
  },
  animationForeground: {
    width: 300,
    height: 300,
    opacity: 0.75,
  },
  foregroundAnimation: {
    width: '100%',
    height: '100%',
  },
  content: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: themeVariables.primaryColor,
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 18,
    textAlign: 'center',
    color: themeVariables.blackColor,
    marginBottom: 24,
    lineHeight: 26,
  },
  highlight: {
    color: themeVariables.secondaryColor,
    fontWeight: '700',
  },
  summaryCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: themeVariables.neutralLight,
    marginBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: themeVariables.primaryColor,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: themeVariables.blackColor,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 14,
  },
  difficultyChip: {
    backgroundColor: themeVariables.whiteColor,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  difficultyChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: themeVariables.secondaryDarkColor,
  },
  primaryCta: {
    width: '100%',
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 12,
  },
  homeCta: {
    backgroundColor: themeVariables.secondaryColor,
  },
  primaryCtaText: {
    fontWeight: '700',
    fontSize: 17,
  },
  linkButton: {
    marginBottom: 12,
  },
  linkText: {
    color: themeVariables.primaryColor,
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryLink: {
    paddingVertical: 6,
  },
  secondaryLinkText: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
