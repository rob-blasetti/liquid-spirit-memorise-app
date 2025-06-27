import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FirstLetterQuizGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  // prepare options on mount and when quote changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIndex(0);
    setMessage('');
    generateOptions(0);
  }, [quote]);

  const generateOptions = (idx) => {
    if (idx >= words.length) {
      setOptions([]);
      return;
    }
    const remaining = words.filter((_, i) => i !== idx);
    const distractors = [];
    while (distractors.length < 3 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    while (distractors.length < 3) {
      distractors.push(words[Math.floor(Math.random() * words.length)]);
    }
    setOptions(shuffle([words[idx], ...distractors]));
  };

  const handleSelect = (word) => {
    if (word === words[index]) {
      const next = index + 1;
      setIndex(next);
      if (next === words.length) {
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
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>First Letter Quiz</Text>
      <Text style={styles.description}>Guess each word using the first letters.</Text>
      <Text style={styles.quote}>{display}</Text>
      {index < words.length ? (
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
    backgroundColor: themeVariables.neutralLight,
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
