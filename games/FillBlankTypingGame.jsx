import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const FillBlankTypingGame = ({ quote, onBack }) => {
  const [words, setWords] = useState([]);
  const [missing, setMissing] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const arr = quote.split(' ');
    const num = Math.min(3, Math.max(1, Math.floor(arr.length / 8)));
    const indices = [];
    while (indices.length < num) {
      const idx = Math.floor(Math.random() * arr.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    setWords(arr);
    setMissing(indices.sort((a, b) => a - b));
    setCurrent(0);
    setInput('');
    setMessage('');
  }, [quote]);

  const handleSubmit = () => {
    const idx = missing[current];
    if (words[idx].replace(/[^a-zA-Z]/g, '').toLowerCase() === input.trim().toLowerCase()) {
      const next = current + 1;
      setCurrent(next);
      setInput('');
      setMessage(next === missing.length ? 'Great job!' : 'Correct!');
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
      <Text style={styles.description}>Type the missing words in the spaces.</Text>
      <Text style={styles.quote}>{display}</Text>
      {current < missing.length && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
          />
          <ThemedButton title="Submit" onPress={handleSubmit} />
        </View>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <ThemedButton title="Back" onPress={onBack} />
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 40,
    minWidth: 80,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginBottom: 8,
  },
});

export default FillBlankTypingGame;
