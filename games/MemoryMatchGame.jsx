import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDifficulty } from '../contexts/DifficultyContext';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const MemoryMatchGame = ({ quote, onBack, onWin }) => {
  const { level } = useDifficulty();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  // Win banner handled by GameRenderer overlay via onWin
  const [guessesLeft, setGuessesLeft] = useState(0);
  // Notify parent on win; overlay is handled in GameRenderer
  useEffect(() => {
    if (status === 'won' && onWin) onWin();
  }, [status, onWin]);

  const initGame = useCallback(() => {
    const words = text.split(/\s+/);
    const uniqueWords = Array.from(new Set(words));
    const dimension = level + 3; // 4x4, 5x5, 6x6
    const totalTiles = dimension * dimension;
    const numPairs = Math.floor(totalTiles / 2);
    const selectedWords = uniqueWords.slice(0, numPairs);
    const initialGuesses = numPairs * 2;
    let pairs = shuffle(
      selectedWords.flatMap((w) => [
        { id: `${w}-1`, word: w, matched: false },
        { id: `${w}-2`, word: w, matched: false },
      ]),
    );
    // If odd total tiles, add a blank placeholder
    if (pairs.length < totalTiles) {
      pairs.push({ id: 'blank', word: '', matched: true });
    }
    setCards(pairs);
    setSelected([]);
    setMessage('');
    setStatus('playing');
    setGuessesLeft(initialGuesses);
  }, [text, level]);
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

  // Compute rows/columns for layout
  const dimension = level + 3; // base dimension for total tiles
  const columns = level === 3 ? 4 : dimension;
  const rows = Math.ceil(cards.length / columns);
  return (
    <View style={styles.container}>
      {/* Win overlay handled at parent */}
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Memory Match</Text>
      <Text style={styles.description}>Find the matching word pairs.</Text>
      <View style={styles.grid}>
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowCards = cards.slice(rowIdx * columns, (rowIdx + 1) * columns);
          return (
            <View key={rowIdx} style={styles.row}>
              {rowCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.card}
                  onPress={() => handlePress(card)}
                >
                  <Text style={styles.cardText}>{isRevealed(card) ? card.word : '?'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
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
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  cardText: {
    fontSize: 10,
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
