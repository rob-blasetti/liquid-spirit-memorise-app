import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { prepareQuoteForGame, pickUniqueWords, sanitizeQuoteText } from '../services/quoteSanitizer';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FirstLetterQuizGame = ({ quote, rawQuote, sanitizedQuote, onBack }) => {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  const entries = quoteData.entries;
  const words = useMemo(
    () => entries.map((entry) => entry.original || entry.clean || ''),
    [entries],
  );
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  const canonicalize = (value) =>
    sanitizeQuoteText(typeof value === 'string' ? value : '').toLocaleLowerCase();

  // prepare options on mount and when quote changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIndex(0);
    setMessage('');
    generateOptions(0);
  }, [quote]);

  const generateOptions = (idx) => {
    if (idx >= entries.length) {
      setOptions([]);
      return;
    }
    const entry = entries[idx];
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffle([entry.original || entry.clean || '', ...distractors]));
  };

  const handleSelect = (word) => {
    const current = entries[index];
    if (!current) return;
    const expectedCanonical = canonicalize(current.original || current.clean || '');
    if (canonicalize(word) === expectedCanonical) {
      const next = index + 1;
      setIndex(next);
      if (next === entries.length) {
        setMessage('Great job!');
        setOptions([]);
      } else {
        setMessage('');
        generateOptions(next);
      }
    } else {
      setMessage('Try again');
    }
  };

  const display = words
    .map((w, i) => (i < index ? w : w.slice(0, 2)))
    .join(' ');

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
    fontSize: 20,
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

export default FirstLetterQuizGame;
