import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import useGameOutcome from './hooks/useGameOutcome';
import { resolveQuoteText, shuffleItems, clampLevelWordLimit } from './gameUtils';

const TapScrambledGame = ({ quote, onBack, onWin, onLose, level = 1 }) => {
  const text = resolveQuoteText(quote);
  const [words, setWords] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const { hasWonRef, resetOutcome, recordMistake, resolveWin } = useGameOutcome({ onWin, onLose });

  const limit = useMemo(() => clampLevelWordLimit(level), [level]);

  useEffect(() => {
    const w = text.split(/\s+/).slice(0, limit);
    setWords(w);
    setScrambled(shuffleItems(w));
    setIndex(0);
    setMessage('');
    resetOutcome();
  }, [text, level, limit, resetOutcome]);

  const handlePress = (word, idx) => {
    if (hasWonRef.current) return;
    if (word === words[index]) {
      setScrambled(prev => prev.filter((_, i) => i !== idx));
      const next = index + 1;
      setIndex(next);
      if (next === words.length) {
        setMessage('Great job!');
        resolveWin();
      } else {
        setMessage('');
      }
    } else {
      setMessage('Try again');
      recordMistake();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Rebuild the quote</Text>
      <Text style={styles.description}>Tap the words in the correct order.</Text>
      <View style={styles.wordBank}>
        {scrambled.map((w, i) => (
          <TouchableOpacity key={`${w}-${i}`} style={styles.wordButton} onPress={() => handlePress(w, i)}>
            <Text style={styles.wordText}>{w}</Text>
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
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordButton: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  wordText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default TapScrambledGame;
