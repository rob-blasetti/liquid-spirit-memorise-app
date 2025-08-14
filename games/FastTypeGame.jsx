import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FastTypeGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [time, setTime] = useState(30);
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const w = text.split(/\s+/);
    setWords(w);
    setIndex(0);
    setMessage('');
    setTime(30);
    generateOptions(w, 0);
    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quote]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (time === 0 && message === '') {
      setMessage("Time's up!");
      setOptions([]);
    }
  }, [time]);

  const generateOptions = (w, idx) => {
    if (idx >= w.length) {
      setOptions([]);
      return;
    }
    const remaining = w.filter((_, i) => i !== idx);
    const distractors = [];
    while (distractors.length < 3 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    while (distractors.length < 3) {
      distractors.push(w[Math.floor(Math.random() * w.length)]);
    }
    setOptions(shuffle([w[idx], ...distractors]));
  };

  const handleSelect = (word) => {
    if (time === 0) return;
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

export default FastTypeGame;
