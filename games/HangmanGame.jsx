import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const MAX_WRONG = 8;

const HangmanGame = ({ quote, onBack }) => {
  const normalized = quote.toLowerCase();
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [input, setInput] = useState('');
  const letters = normalized.split('');
  const masked = letters
    .map((ch) => {
      if (ch === ' ' || !ch.match(/[a-z]/i)) return ch;
      return guessed.includes(ch) ? ch : '_';
    })
    .join('');

  const handleGuess = () => {
    const letter = input.trim().toLowerCase();
    if (!letter) return;
    setInput('');
    if (guessed.includes(letter)) return;
    if (normalized.includes(letter)) {
      setGuessed([...guessed, letter]);
    } else {
      setWrong(w => w + 1);
    }
  };

  const won = masked === normalized;
  const lost = wrong >= MAX_WRONG;

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Hangman</Text>
      <Text style={styles.description}>Guess letters to reveal the quote.</Text>
      <Text style={styles.quote}>{masked}</Text>
      <Text style={styles.status}>{`Wrong guesses: ${wrong}/${MAX_WRONG}`}</Text>
      {won && <Text style={styles.message}>Great job!</Text>}
      {lost && <Text style={styles.message}>Out of guesses!</Text>}
      {!won && !lost && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            maxLength={1}
            autoCapitalize="none"
          />
          <ThemedButton title="Guess" onPress={handleGuess} />
        </View>
      )}
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
  status: {
    fontSize: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 20,
    marginVertical: 8,
    color: themeVariables.primaryColor,
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
    minWidth: 40,
    textAlign: 'center',
  },
});

export default HangmanGame;
