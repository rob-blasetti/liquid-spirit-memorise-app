import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import useGameOutcome from './hooks/useGameOutcome';
import useRevealRound from './hooks/useRevealRound';
import { resolveQuoteText } from './gameUtils';

const palette = [
  themeVariables.primaryColorLight,
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
];

const ColorSwitchGame = ({ quote, onBack, onWin, onLose, level = 1 }) => {
  const text = resolveQuoteText(quote);
  const delay = level === 1 ? 2000 : level === 2 ? 1500 : 1000;
  const words = useMemo(() => text.split(/\s+/).slice(0, 4), [text]);
  const [colors, setColors] = useState([]);
  const [changedIndex, setChangedIndex] = useState(0);
  const [message, setMessage] = useState('');
  const { hasWonRef, resetOutcome, recordMistake, resolveWin } = useGameOutcome({ onWin, onLose });

  const buildBaseRound = useCallback(() => {
    const base = palette.slice(0, Math.max(words.length, 1)).map(c => c);
    const idx = Math.floor(Math.random() * Math.max(base.length, 1));
    return { base, idx };
  }, [words.length]);

  const [roundSeed, setRoundSeed] = useState(() => buildBaseRound());

  const handleReset = useCallback(() => {
    const nextRound = buildBaseRound();
    setRoundSeed(nextRound);
    setColors(nextRound.base);
    setChangedIndex(nextRound.idx);
    setMessage('');
    resetOutcome();
  }, [buildBaseRound, resetOutcome]);

  const handleReveal = useCallback(() => {
    const { base, idx } = roundSeed;
    const newCols = [...base];
    const other = (idx + 1) % palette.length;
    newCols[idx] = palette[other];
    setColors(newCols);
  }, [roundSeed]);

  useRevealRound({
    resetKey: `${text}-${level}`,
    delayMs: delay,
    onReset: handleReset,
    onReveal: handleReveal,
  });

  const handlePress = idx => {
    if (hasWonRef.current) return;
    if (idx === changedIndex) {
      setMessage('Great job!');
      resolveWin();
    } else {
      setMessage('Try again');
      recordMistake();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Color Switch</Text>
      <Text style={styles.description}>Tap the word that changed colour.</Text>
      <View style={styles.row}>
        {words.map((w, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.wordBox, { backgroundColor: colors[i] }]}
            onPress={() => handlePress(i)}
          >
            <Text style={styles.word}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  wordBox: {
    minWidth: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    color: themeVariables.primaryColorDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 24,
  },
});

export default ColorSwitchGame;
