import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import { pickUniqueWords } from '../services/quoteSanitizer';
import useGameOutcome from './hooks/useGameOutcome';
import useQuoteGameData from './hooks/useQuoteGameData';
import { shuffleItems } from './gameUtils';

const scrambleWord = word => {
  if (word.length <= 1) return word;
  const letters = word.split('');
  const first = letters.shift();
  return first + shuffleItems(letters).join('');
};

const LetterScrambleGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const { quoteData, entries, words, canonicalize } = useQuoteGameData({ quote, rawQuote, sanitizedQuote });
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const { hasWonRef, resetOutcome, recordMistake, resolveWin } = useGameOutcome({ onWin, onLose });

  const generateOptions = useCallback((entry) => {
    if (!entry) {
      setOptions([]);
      return;
    }
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffleItems([entry.original || entry.clean || '', ...distractors]));
  }, [quoteData.uniquePlayableWords]);

  useEffect(() => {
    setIndex(0);
    setMessage('');
    if (entries.length > 0) {
      setScrambled(scrambleWord(words[0]));
      generateOptions(entries[0]);
    } else {
      setScrambled('');
      setOptions([]);
    }
    resetOutcome();
  }, [quote, entries, words, generateOptions, resetOutcome]);

  const advance = useCallback((nextIndex) => {
    if (nextIndex < entries.length) {
      setScrambled(scrambleWord(words[nextIndex]));
      generateOptions(entries[nextIndex]);
    } else {
      setScrambled('');
      setOptions([]);
    }
    setIndex(nextIndex);
  }, [entries, words, generateOptions]);

  const handleSelect = choice => {
    if (index >= entries.length || hasWonRef.current) return;
    const current = entries[index];
    const expected = canonicalize(current.original || current.clean || '');
    if (canonicalize(choice) === expected) {
      const nextIndex = index + 1;
      if (nextIndex === entries.length) {
        advance(nextIndex);
        setMessage('Great job!');
        resolveWin();
      } else {
        setMessage('');
        advance(nextIndex);
      }
    } else {
      setMessage('Try again');
      recordMistake();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Unscramble Letters</Text>
      <Text style={styles.description}>Unscramble each word. The first letter stays in place.</Text>
      {index < entries.length ? (
        <>
          <Text style={styles.quote}>{scrambled}</Text>
          <View style={styles.options}>
            {options.map((o, i) => (
              <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
                <Text style={styles.optionText}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
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
    fontSize: 28,
    marginVertical: 24,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
});

export default LetterScrambleGame;
