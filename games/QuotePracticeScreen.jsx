import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const QuotePracticeScreen = ({ quote, onBack, onWin }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  const cleanWord = (w) => w.replace(/[.,!?;:]/g, '').toLowerCase();

  const generateOptions = (idx) => {
    const correct = words[idx];
    const remaining = words.filter((_, i) => i !== idx);
    const distractors = [];
    while (distractors.length < 3 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    while (distractors.length < 3) {
      distractors.push(words[Math.floor(Math.random() * words.length)]);
    }
    setOptions(shuffle([correct, ...distractors]));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIndex(0);
    setMessage('');
    generateOptions(0);
  }, [quote]);

  const handleSelect = (word) => {
    if (cleanWord(word) === cleanWord(words[index])) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      if (nextIndex === words.length) {
        setMessage('Great job!');
        setOptions([]);
        onWin?.({ practice: true, wordsLearned: words.length });
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
      // split word into base and trailing punctuation
      const base = w.replace(/[.,!?;:]+$/, '');
      const punctMatch = w.match(/([.,!?;:]+)$/);
      const punct = punctMatch ? punctMatch[1] : '';
      if (i < index) {
        return w;
      } else if (i === index) {
        // reveal a hint: first third of the word (at least one letter)
        const hintLength = Math.max(1, Math.floor(base.length / 2));
        const hint = base.substring(0, hintLength);
        const blanks = '_'.repeat(base.length - hintLength);
        return hint + blanks + punct;
      } else {
        // upcoming words: full blanks
        const blanks = '_'.repeat(base.length);
        return blanks + punct;
      }
    })
    .join(' ');
  // Provide a static snippet of the beginning of the quote as a hint
  const snippetWordCount = Math.min(3, words.length);
  const snippet = words.slice(0, snippetWordCount).join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Practice Quote</Text>
      <Text style={styles.description}>Try to type the quote one word at a time.</Text>
      {/* Hint snippet to jog memory */}
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
