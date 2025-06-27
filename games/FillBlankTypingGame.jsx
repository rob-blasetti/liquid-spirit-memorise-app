import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FillBlankTypingGame = ({ quote, onBack }) => {
  const [words, setWords] = useState([]);
  const [missing, setMissing] = useState([]);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const arr = quote.split(' ');
    const num = Math.min(3, Math.max(1, Math.floor(arr.length / 8)));
    const indices = [];
    while (indices.length < num) {
      const idx = Math.floor(Math.random() * arr.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    setWords(arr);
    const sorted = indices.sort((a, b) => a - b);
    setMissing(sorted);
    setCurrent(0);
    setMessage('');
    generateOptions(arr, sorted, 0);
  }, [quote]);

  const generateOptions = (arr, indices, idx) => {
    if (idx >= indices.length) {
      setOptions([]);
      return;
    }
    const word = arr[indices[idx]];
    const remaining = arr.filter((w, i) => !indices.includes(i) && w !== word);
    const distractors = [];
    while (distractors.length < 3 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    while (distractors.length < 3) {
      distractors.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    setOptions(shuffle([word, ...distractors]));
  };

  const handleSelect = (word) => {
    const idx = missing[current];
    if (word === words[idx]) {
      const next = current + 1;
      setCurrent(next);
      if (next === missing.length) {
        setMessage('Great job!');
        setOptions([]);
      } else {
        setMessage('Correct!');
        generateOptions(words, missing, next);
      }
    } else {
      setMessage('Try again');
    }
  };

  const display = words.map((w, i) => {
    if (missing.includes(i)) {
      if (missing.indexOf(i) < current) return w;
      return '_'.repeat(w.length);
    }
    return w;
  }).join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Fill in the Blank</Text>
      <Text style={styles.description}>Tap the words that fit in the blanks.</Text>
      <Text style={styles.quote}>{display}</Text>
      {current < missing.length && (
        <View style={styles.options}>
          {options.map((o, i) => (
            <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
              <Text style={styles.optionText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
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
    marginBottom: 16,
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
    marginBottom: 8,
  },
});

export default FillBlankTypingGame;
