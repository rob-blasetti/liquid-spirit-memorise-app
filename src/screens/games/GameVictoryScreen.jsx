import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDifficulty } from '../../app/contexts/DifficultyContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../../ui/stylesheets/theme';
import ThemedButton from '../../ui/components/ThemedButton';

const MAX_LEVEL = 3;
const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

const shuffleItems = (items = []) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const createConfettiDrops = () => {
  const seeds = shuffleItems([
    { top: -24, left: -36, right: 12, height: 246, delayRange: [0, 180] },
    { top: -10, left: -12, right: -24, height: 238, delayRange: [60, 240] },
    { top: 8, left: 10, right: -38, height: 254, delayRange: [100, 320] },
    { top: 26, left: -18, right: -6, height: 270, delayRange: [180, 420] },
    { top: 42, left: 8, right: -24, height: 286, delayRange: [220, 520] },
    { top: 54, left: -30, right: 18, height: 278, delayRange: [260, 620] },
    { top: 70, left: -8, right: -14, height: 296, delayRange: [420, 760] },
    { top: 92, left: 18, right: -30, height: 304, delayRange: [520, 920] },
    { top: 108, left: -26, right: 16, height: 312, delayRange: [620, 1120] },
  ]);

  return seeds.map((seed, index) => {
    const [minDelay, maxDelay] = seed.delayRange;
    const delayMs = minDelay + Math.round(Math.random() * (maxDelay - minDelay));
    return {
      id: `confetti-${index}-${delayMs}`,
      delayMs,
      style: {
        top: seed.top + Math.round(Math.random() * 20) - 10,
        left: seed.left + Math.round(Math.random() * 22) - 11,
        right: seed.right + Math.round(Math.random() * 22) - 11,
        height: seed.height + Math.round(Math.random() * 28) - 14,
        opacity: 0.8 + Math.random() * 0.18,
        transform: [
          { rotate: `${Math.round(Math.random() * 24) - 12}deg` },
          { scaleX: 0.92 + Math.random() * 0.18 },
        ],
      },
    };
  });
};

const GameVictoryScreen = ({
  gameTitle,
  difficultyLabel,
  level = 1,
  onNextLevel,
  onReplay,
  onGoHome,
  onGoGames,
  perfect = false,
  maxLevel = MAX_LEVEL,
}) => {
  const { setLevel } = useDifficulty();
  const insets = useSafeAreaInsets();
  const [showCelebration, setShowCelebration] = useState(true);
  const [confettiDrops, setConfettiDrops] = useState(() => createConfettiDrops());
  const [visibleConfettiIds, setVisibleConfettiIds] = useState([]);
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

  const handleReplay = () => {
    setLevel(normalizedLevel);
    onReplay?.();
  };

  const handleNextDifficulty = () => {
    const targetLevel = Math.min(normalizedLevel + 1, maxLevel);
    setLevel(targetLevel);
    onNextLevel?.();
  };

  const edgeExtensionStyle = useMemo(
    () => ({
      marginTop: -insets.top,
      marginBottom: -insets.bottom,
    }),
    [insets.top, insets.bottom],
  );

  const contentSpacing = useMemo(
    () => ({
      paddingTop: 32 + insets.top,
      paddingBottom: 32 + insets.bottom,
      paddingHorizontal: 24,
    }),
    [insets.top, insets.bottom],
  );

  const starField = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }).map((_, index) => {
      const size = 24 + Math.random() * 18;
      return {
        id: `victory-star-${index}`,
        angle: Math.random() * Math.PI * 2,
        radiusFactor: Math.random(),
        size,
        delay: index * 160 + Math.random() * 200,
        duration: 2200 + Math.random() * 600,
      };
    });
  }, []);

  const rotationValuesRef = useRef(starField.map(() => new Animated.Value(0)));
  const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });
  const [contentLayout, setContentLayout] = useState({ width: 0, height: 0 });

  const handleStarFieldLayout = useCallback(({ nativeEvent }) => {
    const { width: nextWidth, height: nextHeight } = nativeEvent.layout || {};
    if (typeof nextWidth !== 'number' || typeof nextHeight !== 'number') return;
    setFieldSize((prev) => {
      if (Math.abs(prev.width - nextWidth) < 0.5 && Math.abs(prev.height - nextHeight) < 0.5) {
        return prev;
      }
      return { width: nextWidth, height: nextHeight };
    });
  }, []);

  useEffect(() => {
    const animations = rotationValuesRef.current.map((value, index) => {
      value.setValue(0);
      const config = starField[index];
      const animation = Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(value, {
          toValue: 2,
          duration: config.duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      animation.start();
      return animation;
    });
    return () => {
      animations.forEach((animation) => {
        if (animation && typeof animation.stop === 'function') {
          animation.stop();
        }
      });
    };
  }, [starField]);

  useEffect(() => {
    const nextDrops = createConfettiDrops();
    const timeoutIds = nextDrops.map((drop) =>
      setTimeout(() => {
        setVisibleConfettiIds((current) =>
          current.includes(drop.id) ? current : [...current, drop.id],
        );
      }, drop.delayMs),
    );
    const maxDelay = nextDrops.reduce(
      (highest, drop) => Math.max(highest, drop.delayMs),
      0,
    );
    setConfettiDrops(nextDrops);
    setShowCelebration(true);
    setVisibleConfettiIds([]);
    const timeoutId = setTimeout(() => {
      setShowCelebration(false);
      setVisibleConfettiIds([]);
    }, maxDelay + 1400);
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      clearTimeout(timeoutId);
    };
  }, [resolvedGameTitle, normalizedLevel]);

  const handleContentLayout = useCallback(({ nativeEvent }) => {
    const { width: nextWidth, height: nextHeight } = nativeEvent.layout || {};
    if (typeof nextWidth !== 'number' || typeof nextHeight !== 'number') return;
    setContentLayout((prev) => {
      if (Math.abs(prev.width - nextWidth) < 0.5 && Math.abs(prev.height - nextHeight) < 0.5) {
        return prev;
      }
      return { width: nextWidth, height: nextHeight };
    });
  }, []);

  return (
    <View style={[styles.root, edgeExtensionStyle]}>
      {showCelebration ? (
        <View pointerEvents="none" style={styles.celebrationLayer}>
          {confettiDrops
            .filter((drop) => visibleConfettiIds.includes(drop.id))
            .map((drop) => (
              <LottieView
                key={drop.id}
                source={require('../../assets/animations/confetti.json')}
                autoPlay
                loop={false}
                style={[styles.confettiBurst, drop.style]}
              />
            ))}
        </View>
      ) : null}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentSpacing]}
        contentInsetAdjustmentBehavior="never"
        bounces={false}
      >
        <View style={styles.container}>
          <View style={styles.animationLayer}>
            <View pointerEvents="none" style={styles.starField} onLayout={handleStarFieldLayout}>
              {fieldSize.width > 0
                && fieldSize.height > 0
                && starField.map((star, index) => {
                  const centerX = fieldSize.width / 2;
                  const centerY = fieldSize.height / 2;
                  const fallbackSize = 300;
                  const contentWidth = contentLayout.width || fallbackSize;
                  const contentHeight = contentLayout.height || fallbackSize;
                  const baseRadius = Math.max(contentWidth, contentHeight) / 2 + 48;
                  const ringThickness = 80;
                  const radius = baseRadius + star.radiusFactor * ringThickness;
                  const rawLeft = centerX + radius * Math.cos(star.angle);
                  const rawTop = centerY - radius * Math.sin(star.angle);
                  const margin = 16 + star.size / 2;
                  const top = Math.min(
                    fieldSize.height - margin,
                    Math.max(margin, rawTop),
                  );
                  const left = Math.min(
                    fieldSize.width - margin,
                    Math.max(margin, rawLeft),
                  );
                const rotate = rotationValuesRef.current[index].interpolate({
                  inputRange: [0, 2],
                  outputRange: ['0deg', '720deg'],
                });
                return (
                  <Animated.View
                    key={star.id}
                    style={[
                      styles.star,
                      {
                        top,
                        left,
                        transform: [
                          { translateX: -star.size / 2 },
                          { translateY: -star.size / 2 },
                          { rotate },
                        ],
                      },
                      styles.starVisible,
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={star.size}
                      color="rgba(255,255,255,0.85)"
                      style={styles.starIcon}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>
          <View style={styles.content} onLayout={handleContentLayout}>
            <BlurView
              style={styles.contentBlur}
              blurType="light"
              blurAmount={26}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.22)"
            />
            <View pointerEvents="none" style={styles.contentTint} />
            <LinearGradient
              pointerEvents="none"
              colors={[
                'rgba(255,255,255,0.52)',
                'rgba(255,255,255,0.18)',
                'rgba(255,255,255,0.08)',
                'rgba(255,255,255,0)',
              ]}
              locations={[0, 0.35, 0.7, 1]}
              style={styles.contentGloss}
            />
            <View style={styles.contentInner}>
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
              <View style={[styles.actionsRow, !hasNextLevel && styles.actionsRowSingle]}>
                <ThemedButton
                  title="Play Again"
                  onPress={handleReplay}
                  style={[
                    styles.primaryCta,
                    styles.actionButton,
                    styles.replayCta,
                    !hasNextLevel && styles.actionButtonSingle,
                  ]}
                  textStyle={[styles.primaryCtaText, styles.replayCtaText]}
                />
                {hasNextLevel ? (
                  <ThemedButton
                    title={`Play ${nextLevelLabel}`}
                    onPress={handleNextDifficulty}
                    style={[styles.primaryCta, styles.actionButton, styles.nextLevelCta]}
                    textStyle={styles.primaryCtaText}
                  />
                ) : null}
              </View>
              {onGoGames ? (
                <TouchableOpacity style={styles.secondaryLink} onPress={onGoGames}>
                  <Text style={styles.secondaryLinkText}>Choose another game</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GameVictoryScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  celebrationLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  confettiBurst: {
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  animationLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
  },
  starVisible: {
    opacity: 0.9,
  },
  starIcon: {
    textShadowColor: 'rgba(15,32,67,0.55)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#0E1635',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 14,
  },
  contentBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  contentTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  contentGloss: {
    ...StyleSheet.absoluteFillObject,
  },
  contentInner: {
    paddingHorizontal: 28,
    paddingVertical: 34,
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: themeVariables.whiteColor,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(15,32,67,0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subHeading: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  highlight: {
    color: themeVariables.whiteColor,
    fontWeight: '700',
  },
  summaryCard: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
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
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
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
  primaryCta: {
    borderRadius: 999,
    marginBottom: 12,
  },
  nextLevelCta: {
    backgroundColor: themeVariables.primaryColor,
  },
  primaryCtaText: {
    fontWeight: '700',
    fontSize: 17,
  },
  replayCta: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
  },
  replayCtaText: {
    color: themeVariables.primaryColor,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionsRowSingle: {
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSingle: {
    flex: 0,
    width: '100%',
  },
  linkButton: {
    marginBottom: 12,
  },
  linkText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryLink: {
    paddingVertical: 6,
  },
  secondaryLinkText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
