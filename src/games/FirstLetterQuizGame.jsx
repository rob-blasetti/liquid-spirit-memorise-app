import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import { pickUniqueWords } from '../services/quoteSanitizer';
import useGameOutcome from './hooks/useGameOutcome';
import useQuoteGameData from './hooks/useQuoteGameData';
import { shuffleItems } from './gameUtils';

const FirstLetterQuizGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const { quoteData, entries, words, canonicalize } = useQuoteGameData({ quote, rawQuote, sanitizedQuote });
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const { hasWonRef, resetOutcome, recordMistake, resolveWin } = useGameOutcome({ onWin, onLose });

  const generateOptions = useCallback((idx) => {
    if (idx >= entries.length) {
      setOptions([]);
      return;
    }
    const entry = entries[idx];
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffleItems([entry.original || entry.clean || '', ...distractors]));
  }, [entries, quoteData.uniquePlayableWords]);

  useEffect(() => {
    setIndex(0);
    setMessage('');
    generateOptions(0);
    resetOutcome();
  }, [quote, generateOptions, resetOutcome]);

  const handleSelect = word => {
    if (hasWonRef.current) return;
    const current = entries[index];
    if (!current) return;
    const expectedCanonical = canonicalize(current.original || current.clean || '');
    if (canonicalize(word) === expectedCanonical) {
      const next = index + 1;
      setIndex(next);
      if (next === entries.length) {
        setMessage('Great job!');
        setOptions([]);
        resolveWin();
      } else {
        setMessage('');
        generateOptions(next);
      }
    } else {
      setMessage('Try again');
      recordMistake();
    }
  };

  const display = words.map((w, i) => (i < index ? w : w.slice(0, 2))).join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>First Letter Quiz</Text>
      <Text style={styles.description}>Guess each word using the first letters.</Text>
      <Text style={styles.quote}>{display}</Text>
      {index < entries.length ? (
        <View style={styles.options}>
          {options.map((o, i) => (
            <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
              <Text style={styles.optionText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.message}>Great job!</Text>
      )}
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
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 24,
    marginVertical: 16,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 6,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionText: {
    color: themeVariables.primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 24,
  },
});

export default FirstLetterQuizGame;
