import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const MAX_WRONG = 8;

const HangmanGame = ({ quote, onBack }) => {
  const normalized = quote.toLowerCase();
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [letterChoices, setLetterChoices] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const letters = normalized.split('');
  const masked = letters
    .map((ch) => {
      if (ch === ' ' || !ch.match(/[a-z]/i)) return ch;
      return guessed.includes(ch) ? ch : '_';
    })
    .join('');

  // Generate 4 letter choices: 2 correct (unguessed) and 2 incorrect
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const generateChoices = () => {
    const unguessedCorrect = [...new Set(letters.filter(ch => /[a-z]/i.test(ch) && !guessed.includes(ch)))];
    const correctCount = Math.min(2, unguessedCorrect.length);
    const correct = [];
    const correctPool = [...unguessedCorrect];
    for (let i = 0; i < correctCount; i++) {
      const idx = Math.floor(Math.random() * correctPool.length);
      correct.push(correctPool.splice(idx, 1)[0]);
    }
    const incorrect = [];
    const wrongPool = alphabet.filter(ch => !normalized.includes(ch) && !guessed.includes(ch));
    const distractCount = 4 - correct.length;
    for (let i = 0; i < distractCount && wrongPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * wrongPool.length);
      incorrect.push(wrongPool.splice(idx, 1)[0]);
    }
    const all = [...correct, ...incorrect];
    return all.sort(() => Math.random() - 0.5);
  };

  const handleGuess = (letter) => {
    if (status !== 'playing' || guessed.includes(letter)) return;
    if (normalized.includes(letter)) {
      const newGuessed = [...guessed, letter];
      setGuessed(newGuessed);
      // check win
      const newMasked = letters
        .map(ch => (ch.match(/[a-z]/i) ? (newGuessed.includes(ch) ? ch : '_') : ch))
        .join('');
      if (newMasked === normalized) {
        setStatus('won');
      }
    } else {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= MAX_WRONG) {
        setStatus('lost');
      }
    }
  };

  // prepare letter choices on mount and after each guess
  useEffect(() => {
    if (status === 'playing') {
      setLetterChoices(generateChoices());
    }
  }, [guessed, status]);

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Hangman</Text>
      <Text style={styles.description}>Guess letters to reveal the quote.</Text>
      <Text style={styles.quote}>{masked}</Text>
      <Text style={styles.status}>{`Wrong guesses: ${wrong}/${MAX_WRONG}`}</Text>
      {status === 'won' && <Text style={styles.message}>Great job!</Text>}
      {status === 'lost' && <Text style={styles.message}>Out of guesses!</Text>}
      {status === 'playing' && (
        <View style={styles.choicesContainer}>
          {letterChoices.map((letter, i) => (
            <ThemedButton
              key={i}
              title={letter.toUpperCase()}
              onPress={() => handleGuess(letter)}
              style={styles.choiceButton}
            />
          ))}
        </View>
      )}
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
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  choiceButton: {
    margin: 4,
  },
});

export default HangmanGame;
