import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const NextWordQuizGame = ({ quote, onBack }) => {
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const w = quote.split(/\s+/);
    setWords(w);
    setIndex(0);
    setMessage('');
    generateOptions(w, 0);
  }, [quote]);

  const generateOptions = (w, idx) => {
    if (idx >= w.length) {
      setOptions([]);
      return;
    }
    const remaining = w.slice(idx + 1);
    const distractors = [];
    while (distractors.length < 2 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    setOptions(shuffle([w[idx], ...distractors]));
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
        generateOptions(words, next);
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick the next word</Text>
      <Text style={styles.quote}>{words.slice(0, index).join(' ')}</Text>
      <View style={styles.options}>
        {options.map((o, i) => (
          <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
            <Text style={styles.optionText}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
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
    textAlign: 'center',
  },
  quote: {
    fontSize: 20,
    marginVertical: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: themeVariables.secondaryLightColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionText: {
    fontSize: 18,
    color: themeVariables.whiteColor,
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

export default NextWordQuizGame;
