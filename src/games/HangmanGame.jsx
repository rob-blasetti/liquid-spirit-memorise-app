import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import ThemedButton from '../ui/components/ThemedButton';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { BlurView } from '@react-native-community/blur';
import DashedDivider from '../ui/components/DashedDivider';
import useGameOutcome from './hooks/useGameOutcome';
import { resolveQuoteText } from './gameUtils';

const MAX_WRONG = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const initGuessed = (text, level) => {
  const words = text.split(/\s+/);
  const maxReveal = Math.max(0, words.length - 1);
  const revealCount = Math.min(maxReveal, 3 - level);
  const available = words.map((_, idx) => idx);
  const revealIndices = [];
  for (let i = 0; i < revealCount; i += 1) {
    const pick = Math.floor(Math.random() * available.length);
    revealIndices.push(available.splice(pick, 1)[0]);
  }
  const revealedLetters = new Set();
  revealIndices.forEach(wordIdx => {
    const word = words[wordIdx];
    for (const ch of word) {
      if (/[a-z]/i.test(ch)) revealedLetters.add(ch.toLowerCase());
    }
  });
  return Array.from(revealedLetters);
};

const HangmanGame = ({ quote, onBack, onWin, onLose, level = 1 }) => {
  const text = resolveQuoteText(quote);
  const normalized = text.toLowerCase();
  const numericLevel = Number(level);
  const difficultyLevel = Number.isFinite(numericLevel) && numericLevel > 0
    ? Math.min(Math.max(Math.floor(numericLevel), 1), 3)
    : 1;

  const [guessed, setGuessed] = useState(() => initGuessed(text, difficultyLevel));
  const [wrong, setWrong] = useState(0);
  const [letterChoices, setLetterChoices] = useState([]);
  const [status, setStatus] = useState('playing');
  const {
    resetOutcome,
    recordMistake,
    resolveWin,
    resolveLose,
  } = useGameOutcome({ onWin, onLose });

  const letters = useMemo(() => normalized.split(''), [normalized]);

  const masked = useMemo(
    () =>
      letters
        .map(ch => {
          if (ch === ' ' || !/[a-z]/i.test(ch)) return ch;
          return guessed.includes(ch) ? ch : '_';
        })
        .join(''),
    [letters, guessed],
  );

  const generateChoices = useCallback(() => {
    const unguessedCorrect = [...new Set(letters.filter(ch => /[a-z]/i.test(ch) && !guessed.includes(ch)))];
    const correctCount = Math.min(2, unguessedCorrect.length);
    const correct = [];
    const correctPool = [...unguessedCorrect];
    for (let i = 0; i < correctCount; i += 1) {
      const idx = Math.floor(Math.random() * correctPool.length);
      correct.push(correctPool.splice(idx, 1)[0]);
    }
    const incorrect = [];
    const wrongPool = ALPHABET.filter(ch => !normalized.includes(ch) && !guessed.includes(ch));
    const totalChoices = 4 + (difficultyLevel - 1) * 2;
    const distractCount = totalChoices - correct.length;
    for (let i = 0; i < distractCount && wrongPool.length > 0; i += 1) {
      const idx = Math.floor(Math.random() * wrongPool.length);
      incorrect.push(wrongPool.splice(idx, 1)[0]);
    }
    return [...correct, ...incorrect].sort(() => Math.random() - 0.5);
  }, [letters, guessed, normalized, difficultyLevel]);

  useEffect(() => {
    setGuessed(initGuessed(text, difficultyLevel));
    setWrong(0);
    setStatus('playing');
    resetOutcome();
  }, [difficultyLevel, text, resetOutcome]);

  useEffect(() => {
    if (status === 'playing') {
      setLetterChoices(generateChoices());
    } else {
      setLetterChoices([]);
    }
  }, [guessed, status, generateChoices]);

  const handleGuess = letter => {
    if (status !== 'playing' || guessed.includes(letter)) return;
    if (normalized.includes(letter)) {
      const newGuessed = [...guessed, letter];
      setGuessed(newGuessed);
      const newMasked = letters
        .map(ch => (/[a-z]/i.test(ch) ? (newGuessed.includes(ch) ? ch : '_') : ch))
        .join('');
      if (newMasked === normalized) {
        setStatus('won');
        resolveWin();
      }
    } else {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      recordMistake();
      if (newWrong >= MAX_WRONG) {
        setStatus('lost');
        resolveLose();
      }
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <View style={styles.mainArea}>
        <View style={styles.titleRow}>
          <View style={styles.titleMotif}>
            <SwayingGallows />
          </View>
          <Text style={styles.title}>Hangman</Text>
        </View>
        <DashedDivider style={styles.titleUnderline} />
        <View style={styles.quoteWrap}>
          <Text style={styles.quote}>{masked}</Text>
        </View>
      </View>
      <MissesCountdown wrong={wrong} max={MAX_WRONG} />
      {status === 'playing' && (
        <View style={styles.choicesContainerFloating} pointerEvents="box-none">
          <View style={styles.choicesTray}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={18}
              reducedTransparencyFallbackColor="rgba(255,255,255,0.9)"
            />
            <View style={styles.choicesTint} />
            <View style={styles.choicesInner}>
              {letterChoices.map((letter, i) => (
                <ThemedButton
                  key={i}
                  title={letter.toUpperCase()}
                  onPress={() => handleGuess(letter)}
                  style={styles.choiceButton}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const SwayingGallows = () => {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rotate, { toValue: -1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]).start(() => loop());
    };
    loop();
  }, [rotate]);
  const rot = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] });
  return (
    <Animated.View style={[styles.motifSvg, { transform: [{ rotate: rot }] }] }>
      <Svg width={48} height={40} viewBox="0 0 48 40">
        <Line x1="8" y1="36" x2="40" y2="36" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="14" y1="36" x2="14" y2="6" stroke={themeVariables.primaryColor} strokeWidth="3" />
        <Line x1="14" y1="6" x2="30" y2="6" stroke={themeVariables.primaryColor} strokeWidth="3" />
        <Line x1="30" y1="6" x2="30" y2="14" stroke={themeVariables.primaryColor} strokeWidth="2" />
        <Circle cx="30" cy="18" r="4" fill={themeVariables.whiteColor} stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="22" x2="30" y2="28" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="24" x2="26" y2="22" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="24" x2="34" y2="22" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="28" x2="26" y2="34" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="28" x2="34" y2="34" stroke={themeVariables.borderColor} strokeWidth="2" />
      </Svg>
    </Animated.View>
  );
};

const MissesCountdown = ({ wrong, max }) => {
  const remaining = Math.max(0, max - wrong);
  const size = 40;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = remaining / Math.max(1, max);
  const offset = circumference * (1 - progress);
  const ropeDark = '#8E6B3A';
  const ropeLight = '#D3B07A';
  const ringColor = themeVariables.woodDark || ropeDark;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [wrong, pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <View style={styles.missesWrap} pointerEvents="none">
      <Text style={styles.missesLabel}>Misses</Text>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="rgba(255,255,255,0.9)" />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={ropeLight}
            strokeWidth={Math.max(2, stroke - 3)}
            strokeDasharray={`3 ${Math.max(3, Math.floor(r / 2))}`}
            strokeDashoffset={offset}
            fill="none"
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.9}
          />
          <SvgText x={cx} y={cy + 4} textAnchor="middle" fontSize={14} fontWeight="900" stroke={themeVariables.whiteColor} strokeWidth={2} fill="none">
            {remaining}
          </SvgText>
          <SvgText x={cx} y={cy + 4} textAnchor="middle" fontSize={14} fontWeight="900" fill={themeVariables.primaryColor}>
            {remaining}
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: 'transparent',
  },
  mainArea: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 28,
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Noto Sans',
    fontWeight: '900',
    color: themeVariables.primaryColor,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  titleMotif: {
    width: 54,
    height: 40,
    marginRight: 6,
    position: 'relative',
  },
  motifSvg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  titleUnderline: {
    alignSelf: 'center',
    width: 180,
    marginTop: 2,
    marginBottom: 6,
  },
  quoteWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quote: {
    fontSize: 24,
    textAlign: 'center',
  },
  missesWrap: {
    position: 'absolute',
    left: 12,
    bottom: 54,
    alignItems: 'center',
    zIndex: 5,
  },
  missesLabel: {
    fontSize: 12,
    color: themeVariables.primaryColor,
    marginBottom: 4,
    fontWeight: '700',
  },
  choicesContainerFloating: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 124,
  },
  choicesTray: {
    alignSelf: 'center',
    maxWidth: 640,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  choicesTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  choicesInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  choiceButton: {
    margin: 4,
  },
});

export default HangmanGame;
