import React, { useState, useEffect } from 'react';
import { useDifficulty } from '../contexts/DifficultyContext';
import { useUser } from '../contexts/UserContext';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import RewardBanner from '../components/RewardBanner';
import themeVariables from '../styles/theme';

const MAX_WRONG = 8;

// Compute initial guessed letters by revealing whole words based on difficulty level
const initGuessed = (text, level) => {
  const words = text.split(/\s+/);
  // easy (1): reveal up to 2 words; medium (2): 1 word; hard (3): 0 words
  const maxReveal = Math.max(0, words.length - 1);
  const revealCount = Math.min(maxReveal, 3 - level);
  const available = words.map((_, idx) => idx);
  const revealIndices = [];
  for (let i = 0; i < revealCount; i++) {
    const pick = Math.floor(Math.random() * available.length);
    revealIndices.push(available.splice(pick, 1)[0]);
  }
  const revealedLetters = new Set();
  revealIndices.forEach((wordIdx) => {
    const word = words[wordIdx];
    for (const ch of word) {
      if (/[a-z]/i.test(ch)) revealedLetters.add(ch.toLowerCase());
    }
  });
  return Array.from(revealedLetters);
};

const HangmanGame = ({ quote, onBack, onWin }) => {
  const { level } = useDifficulty();
  const { markDifficultyComplete } = useUser();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const normalized = text.toLowerCase();
  // Guessed letters, initially revealing words per difficulty
  const [guessed, setGuessed] = useState(() => initGuessed(text, level));
  const [wrong, setWrong] = useState(0);
  const [letterChoices, setLetterChoices] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showBanner, setShowBanner] = useState(false);

  // Reset game state when difficulty level (or text) changes
  useEffect(() => {
    setGuessed(initGuessed(text, level));
    setWrong(0);
    setStatus('playing');
    setShowBanner(false);
  }, [level, text]);
  const letters = normalized.split('');
  const masked = letters
    .map((ch) => {
      if (ch === ' ' || !ch.match(/[a-z]/i)) return ch;
      return guessed.includes(ch) ? ch : '_';
    })
    .join('');

  // Generate letter choices based on difficulty: total options = 4 (easy), 6 (medium), 8 (hard)
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
    // Determine total number of choices based on difficulty level
    const totalChoices = 4 + (level - 1) * 2; // 4, 6, or 8
    const distractCount = totalChoices - correct.length;
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

  // show banner on win; call onWin after banner completes for consistency
  useEffect(() => {
    if (status === 'won') {
      setShowBanner(true);
      // record difficulty completion
      markDifficultyComplete(level);
    }
  }, [status, level, markDifficultyComplete]);
  // prepare letter choices on mount and after each guess
  useEffect(() => {
    if (status === 'playing') {
      setLetterChoices(generateChoices());
    }
  }, [guessed, status]);

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.title}>Hangman</Text>
        <Text style={styles.description}>Guess letters to reveal the quote.</Text>
        <Text style={styles.quote}>{masked}</Text>
        <Text style={styles.status}>{`Wrong guesses: ${wrong}/${MAX_WRONG}`}</Text>
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
      {showBanner && (
        <RewardBanner
          onAnimationEnd={() => {
            setShowBanner(false);
            if (onWin) onWin();
          }}
        />
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
    backgroundColor: themeVariables.greyColor,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
