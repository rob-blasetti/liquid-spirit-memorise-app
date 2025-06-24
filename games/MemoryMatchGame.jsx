import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const MemoryMatchGame = ({ quote, onBack }) => {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const words = quote.split(/\s+/);
    const unique = Array.from(new Set(words)).slice(0, 6);
    const pairs = shuffle(
      unique.flatMap((w) => [
        { id: `${w}-1`, word: w, matched: false },
        { id: `${w}-2`, word: w, matched: false },
      ]),
    );
    setCards(pairs);
    setSelected([]);
    setMessage('');
  }, [quote]);

  const handlePress = (card) => {
    if (card.matched || selected.find((c) => c.id === card.id)) return;
    const newSelected = [...selected, card];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      if (newSelected[0].word === newSelected[1].word) {
        setCards((prev) =>
          prev.map((c) =>
            c.word === card.word ? { ...c, matched: true } : c,
          ),
        );
        setSelected([]);
        if (cards.every((c) => c.matched || c.word === card.word)) {
          setMessage('Great job!');
        }
      } else {
        setTimeout(() => setSelected([]), 700);
      }
    }
  };

  const isRevealed = (card) => card.matched || selected.find((c) => c.id === card.id);

  return (
    <View style={styles.container}>
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
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default MemoryMatchGame;
