import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';
import { pickUniqueWords } from '../services/quoteSanitizer';
import useQuoteGameData from './hooks/useQuoteGameData';
import { shuffleItems } from './gameUtils';

const QuotePracticeScreen = ({ quote, rawQuote, sanitizedQuote, onBack, onWin }) => {
  const { quoteData, entries, words, canonicalize } = useQuoteGameData({ quote, rawQuote, sanitizedQuote });
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  const generateOptions = useCallback((idx) => {
    const entry = entries[idx];
    if (!entry) {
      setOptions([]);
      return;
    }
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    const correctDisplay = entry.original || entry.clean || '';
    setOptions(shuffleItems([correctDisplay, ...distractors]));
  }, [entries, quoteData.uniquePlayableWords]);

  useEffect(() => {
    setIndex(0);
    setMessage('');
    generateOptions(0);
  }, [quote, generateOptions]);

  const handleSelect = word => {
    const current = entries[index];
    if (!current) return;
    const expectedCanonical = canonicalize(current.original || current.clean || '');
    if (canonicalize(word) === expectedCanonical) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      if (nextIndex === entries.length) {
        setMessage('Great job!');
        setOptions([]);
        onWin?.({ practice: true, wordsLearned: entries.length });
      } else {
        setMessage('');
        generateOptions(nextIndex);
      }
    } else {
      setMessage('Try again');
    }
  };

  const displayedQuote = words
    .map((w, i) => {
      const base = w.replace(/[.,!?;:]+$/, '');
      const punctMatch = w.match(/([.,!?;:]+)$/);
      const punct = punctMatch ? punctMatch[1] : '';
      if (i < index) {
        return w;
      }
      if (i === index) {
        const hintLength = Math.max(1, Math.floor(base.length / 2));
        const hint = base.substring(0, hintLength);
        const blanks = '_'.repeat(base.length - hintLength);
        return hint + blanks + punct;
      }
      const blanks = '_'.repeat(base.length);
      return blanks + punct;
    })
    .join(' ');

  const snippetWordCount = Math.min(3, entries.length);
  const snippet = words.slice(0, snippetWordCount).join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Practice Quote</Text>
      <Text style={styles.description}>Try to type the quote one word at a time.</Text>
      <Text style={styles.hint}>Hint: {snippet}...</Text>
      <Text style={styles.quote}>{displayedQuote}</Text>
      {index < words.length ? (
        <View style={styles.options}>
          {options.map((o, i) => (
            <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
              <Text style={styles.optionText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.message}>Great job! You finished.</Text>
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
  hint: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 14,
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
    marginTop: 8,
    fontSize: 18,
    color: themeVariables.primaryColor,
  },
});

export default QuotePracticeScreen;
