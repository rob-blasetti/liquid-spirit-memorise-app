import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import { pickUniqueWords } from '../services/quoteSanitizer';
import useGameOutcome from './hooks/useGameOutcome';
import useQuoteGameData from './hooks/useQuoteGameData';
import { shuffleItems } from './gameUtils';

const FastTypeGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const { quoteData, entries, canonicalize } = useQuoteGameData({ quote, rawQuote, sanitizedQuote });
  const [time, setTime] = useState(30);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const { hasWonRef, resetOutcome, recordMistake, resolveWin, resolveLose } = useGameOutcome({ onWin, onLose });

  const generateOptions = useCallback((entryList, idx) => {
    if (idx >= entryList.length) {
      setOptions([]);
      return;
    }
    const entry = entryList[idx];
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffleItems([entry.original || entry.clean || '', ...distractors]));
  }, [quoteData.uniquePlayableWords]);

  useEffect(() => {
    setIndex(0);
    setMessage('');
    setTime(30);
    generateOptions(entries, 0);
    resetOutcome();
    const timer = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quote, entries, generateOptions, resetOutcome]);

  useEffect(() => {
    if (time === 0 && message === '') {
      setMessage("Time's up!");
      setOptions([]);
      resolveLose();
    }
  }, [time, message, resolveLose]);

  const handleSelect = word => {
    if (time === 0 || hasWonRef.current) return;
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
        generateOptions(entries, next);
      }
    } else {
      setMessage('Try again');
      recordMistake();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Tap It Fast</Text>
      <Text style={styles.description}>Tap each word in order before time runs out!</Text>
      <Text style={styles.timer}>Time: {time}</Text>
      <View style={styles.options}>
        {options.map((o, i) => (
          <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
            <Text style={styles.optionText}>{o}</Text>
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
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 18,
    marginBottom: 8,
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
    paddingVertical: 8,
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
    fontSize: 20,
    color: themeVariables.primaryColor,
    marginTop: 16,
  },
});

export default FastTypeGame;
