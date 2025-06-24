import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const scrambleWord = (word) => {
  if (word.length <= 1) return word;
  const letters = word.split('');
  const first = letters.shift();
  return first + shuffle(letters).join('');
};

const LetterScrambleGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIndex(0);
    setInput('');
    setMessage('');
    setScrambled(scrambleWord(words[0]));
  }, [quote]);

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex < words.length) {
      setScrambled(scrambleWord(words[nextIndex]));
    }
    setIndex(nextIndex);
    setInput('');
  };

  const check = () => {
    if (input.trim().toLowerCase() === words[index].toLowerCase()) {
      if (index + 1 === words.length) {
        setIndex(index + 1);
        setMessage('Great job!');
      } else {
        setMessage('');
        next();
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Unscramble Letters</Text>
      <Text style={styles.description}>Unscramble each word. The first letter stays in place.</Text>
      {index < words.length ? (
        <>
          <Text style={styles.quote}>{scrambled}</Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Word"
          />
          <ThemedButton title="Submit" onPress={check} />
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    width: '80%',
    fontSize: 18,
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

export default LetterScrambleGame;
