import React, { useState, useEffect, useRef } from 'react';
import { useDifficulty } from '../contexts/DifficultyContext';
import { useUser } from '../contexts/UserContext';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import Svg, { Line, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { BlurView } from '@react-native-community/blur';

const MAX_WRONG = 8;

// Compute initial guessed letters by revealing whole words based on difficulty level
const initGuessed = (text, level) => {
  const words = text.split(/\s+/);
  // easy (1): reveal up to 2 words; medium (2): 1 word; hard (3): 0 words
  const maxReveal = Math.max(0, words.length - 1);
  const revealCount = Math.min(maxReveal, 3 - level);
  const available = words.map((_, idx) => idx);
  const revealIndices = [];
  for (let i = 0; i < revealCount; i++) {
    const pick = Math.floor(Math.random() * available.length);
    revealIndices.push(available.splice(pick, 1)[0]);
  }
  const revealedLetters = new Set();
  revealIndices.forEach((wordIdx) => {
    const word = words[wordIdx];
    for (const ch of word) {
      if (/[a-z]/i.test(ch)) revealedLetters.add(ch.toLowerCase());
    }
  });
  return Array.from(revealedLetters);
};

const HangmanGame = ({ quote, onBack, onWin, onLose }) => {
  const { level } = useDifficulty();
  const { markDifficultyComplete } = useUser();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const normalized = text.toLowerCase();
  // Guessed letters, initially revealing words per difficulty
  const [guessed, setGuessed] = useState(() => initGuessed(text, level));
  const [wrong, setWrong] = useState(0);
  const [letterChoices, setLetterChoices] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  // Victory screen navigation handled by GameRenderer via onWin

  // Reset game state when difficulty level (or text) changes
  useEffect(() => {
    setGuessed(initGuessed(text, level));
    setWrong(0);
    setStatus('playing');
  }, [level, text]);
  const letters = normalized.split('');
  const masked = letters
    .map((ch) => {
      if (ch === ' ' || !ch.match(/[a-z]/i)) return ch;
      return guessed.includes(ch) ? ch : '_';
    })
    .join('');

  // Generate letter choices based on difficulty: total options = 4 (easy), 6 (medium), 8 (hard)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const generateChoices = () => {
    const unguessedCorrect = [...new Set(letters.filter(ch => /[a-z]/i.test(ch) && !guessed.includes(ch)))];
    const correctCount = Math.min(2, unguessedCorrect.length);
    const correct = [];
    const correctPool = [...unguessedCorrect];
    for (let i = 0; i < correctCount; i++) {
      const idx = Math.floor(Math.random() * correctPool.length);
      correct.push(correctPool.splice(idx, 1)[0]);
    }
    const incorrect = [];
    const wrongPool = alphabet.filter(ch => !normalized.includes(ch) && !guessed.includes(ch));
    // Determine total number of choices based on difficulty level
    const totalChoices = 4 + (level - 1) * 2; // 4, 6, or 8
    const distractCount = totalChoices - correct.length;
    for (let i = 0; i < distractCount && wrongPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * wrongPool.length);
      incorrect.push(wrongPool.splice(idx, 1)[0]);
    }
    const all = [...correct, ...incorrect];
    return all.sort(() => Math.random() - 0.5);
  };

  const handleGuess = (letter) => {
    if (status !== 'playing' || guessed.includes(letter)) return;
    if (normalized.includes(letter)) {
      const newGuessed = [...guessed, letter];
      setGuessed(newGuessed);
      // check win
      const newMasked = letters
        .map(ch => (ch.match(/[a-z]/i) ? (newGuessed.includes(ch) ? ch : '_') : ch))
        .join('');
      if (newMasked === normalized) {
        setStatus('won');
      }
    } else {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= MAX_WRONG) {
        setStatus('lost');
      }
    }
  };

  // Notify parent on win; overlay is handled in GameRenderer
  const winHandledRef = useRef(false);
  useEffect(() => {
    if (status === 'won' && !winHandledRef.current) {
      winHandledRef.current = true;
      // record difficulty completion
      markDifficultyComplete(level);
      if (onWin) onWin();
    }
  }, [status, level, markDifficultyComplete, onWin]);
  // Reset win handler when level or quote changes
  useEffect(() => { winHandledRef.current = false; }, [level, text]);
  // prepare letter choices on mount and after each guess
  useEffect(() => {
    if (status === 'playing') {
      setLetterChoices(generateChoices());
    }
  }, [guessed, status]);

  // Notify parent on loss to show LostOverlay
  useEffect(() => {
    if (status === 'lost' && onLose) onLose();
  }, [status, onLose]);

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
        <View style={styles.titleUnderline} />
        <View style={styles.quoteWrap}>
          <Text style={styles.quote}>{masked}</Text>
          {/* Loss overlay handled by parent; no inline loss text */}
        </View>
      </View>
      {/* Thematic bottom-left counter */}
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
            {/* Light tint above blur to get a frosted look */}
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
      {/* Victory flow handled by parent GameRenderer */}
    </View>
  );
};

// Small animated gallows motif used in the title row
const SwayingGallows = () => {
  const rotate = useRef(new Animated.Value(0)).current; // -1 .. 1
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
        {/* Base */}
        <Line x1="8" y1="36" x2="40" y2="36" stroke={themeVariables.borderColor} strokeWidth="2" />
        {/* Post and beam */}
        <Line x1="14" y1="36" x2="14" y2="6" stroke={themeVariables.primaryColor} strokeWidth="3" />
        <Line x1="14" y1="6" x2="30" y2="6" stroke={themeVariables.primaryColor} strokeWidth="3" />
        {/* Rope */}
        <Line x1="30" y1="6" x2="30" y2="14" stroke={themeVariables.primaryColor} strokeWidth="2" />
        {/* Head */}
        <Circle cx="30" cy="18" r="4" fill={themeVariables.whiteColor} stroke={themeVariables.borderColor} strokeWidth="2" />
        {/* Body */}
        <Line x1="30" y1="22" x2="30" y2="28" stroke={themeVariables.borderColor} strokeWidth="2" />
        {/* Arms */}
        <Line x1="30" y1="24" x2="26" y2="22" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="24" x2="34" y2="22" stroke={themeVariables.borderColor} strokeWidth="2" />
        {/* Legs */}
        <Line x1="30" y1="28" x2="26" y2="34" stroke={themeVariables.borderColor} strokeWidth="2" />
        <Line x1="30" y1="28" x2="34" y2="34" stroke={themeVariables.borderColor} strokeWidth="2" />
      </Svg>
    </Animated.View>
  );
};

// Bottom-left circular countdown for misses
const MissesCountdown = ({ wrong, max }) => {
  const remaining = Math.max(0, max - wrong);
  // Total widget height (label + gap + ring) should equal FAB size (56)
  // With label ~12px and gap 4px, ring size ~40px achieves alignment
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
  // Pulse animation when misses change
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
          {/* Background circle */}
          <Circle cx={cx} cy={cy} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="rgba(255,255,255,0.9)" />
          {/* Progress (remaining) */}
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
          {/* Rope highlight dashes to suggest texture */}
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
          {/* Outlined number for better readability */}
          <SvgText
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize={14}
            fontWeight="900"
            stroke={themeVariables.whiteColor}
            strokeWidth={2}
            fill="none"
          >
            {remaining}
          </SvgText>
          <SvgText
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize={14}
            fontWeight="900"
            fill={themeVariables.primaryColor}
          >
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
    borderBottomWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    borderStyle: 'dashed',
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
    bottom: 54, // align bottom of ring with FAB bottom (54)
    alignItems: 'center',
    zIndex: 5,
  },
  missesLabel: {
    fontSize: 12,
    color: themeVariables.primaryColor,
    marginBottom: 4,
    fontWeight: '700',
  },
  
  message: {
    fontSize: 20,
    marginVertical: 8,
    color: themeVariables.primaryColor,
  },
  choicesContainerFloating: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 124, // above FAB (54) + its size (56) + buffer
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
