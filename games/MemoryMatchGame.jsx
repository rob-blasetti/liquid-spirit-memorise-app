import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import RewardBanner from '../components/RewardBanner';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const MemoryMatchGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showBanner, setShowBanner] = useState(false);
  const [guessesLeft, setGuessesLeft] = useState(0);
  // show banner on win
  useEffect(() => {
    if (status === 'won') setShowBanner(true);
  }, [status]);

  const initGame = useCallback(() => {
    const words = text.split(/\s+/);
    const unique = Array.from(new Set(words)).slice(0, 8);
    const initialGuesses = unique.length * 2;
    const pairs = shuffle(
      unique.flatMap((w) => [
        { id: `${w}-1`, word: w, matched: false },
        { id: `${w}-2`, word: w, matched: false },
      ]),
    );
    setCards(pairs);
    setSelected([]);
    setMessage('');
    setStatus('playing');
    setGuessesLeft(initialGuesses);
  }, [text]);
  useEffect(() => {
    initGame();
  }, [initGame]);

  const handlePress = (card) => {
    if (status !== 'playing' || card.matched || selected.find((c) => c.id === card.id)) return;
    const newSelected = [...selected, card];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      if (newSelected[0].word === newSelected[1].word) {
        setCards((prev) => {
          const updated = prev.map((c) =>
            c.word === card.word ? { ...c, matched: true } : c,
          );
          // if all cards matched, win
          if (updated.every((c2) => c2.matched)) {
            setStatus('won');
            setMessage('Great job!');
          }
          return updated;
        });
        setSelected([]);
      } else {
        // decrement guesses and check loss
        setGuessesLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) setStatus('lost');
          return next;
        });
        setTimeout(() => setSelected([]), 700);
      }
    }
  };

  const isRevealed = (card) =>
    card.matched || selected.find((c) => c.id === card.id) || status !== 'playing';

  return (
    <View style={styles.container}>
      {/* Win overlay */}
      {showBanner && <RewardBanner onAnimationEnd={() => setShowBanner(false)} />}
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Memory Match</Text>
      <Text style={styles.description}>Find the matching word pairs.</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => handlePress(card)}
          >
            <Text style={styles.cardText}>{isRevealed(card) ? card.word : '?'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {status === 'playing' && (
        <Text style={styles.guessCount}>Guesses left: {guessesLeft}</Text>
      )}
      {message !== '' && status === 'won' && (
        <Text style={styles.message}>{message}</Text>
      )}
      {status === 'lost' && (
        <Text style={styles.message}>Out of guesses!</Text>
      )}
      {status !== 'playing' && (
        <ThemedButton title="Play Again" onPress={initGame} style={styles.playButton} />
      )}
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
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  cardText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  guessCount: {
    fontSize: 16,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
  playButton: {
    width: '80%',
    marginTop: 16,
  },
});

export default MemoryMatchGame;
