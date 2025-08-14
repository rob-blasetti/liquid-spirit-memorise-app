import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';

// Show a line of words. After a short delay one word changes colour.
// The player must tap the word that changed.
const palette = [
  themeVariables.primaryColorLight,
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
];

const ColorSwitchGame = ({ quote, onBack }) => {
  const { level } = useDifficulty();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const delay = level === 1 ? 2000 : level === 2 ? 1500 : 1000;
  const words = text.split(/\s+/).slice(0, 4);
  const [colors, setColors] = useState([]);
  const [changedIndex, setChangedIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    startRound();
  }, [level]);

  const startRound = () => {
    const base = palette.map((c) => c);
    setColors(base);
    const idx = Math.floor(Math.random() * base.length);
    setChangedIndex(idx);
    setMessage('');
    setTimeout(() => {
      const newCols = [...base];
      const other = (idx + 1) % base.length;
      newCols[idx] = palette[other];
      setColors(newCols);
    }, delay);
  };

  const handlePress = (idx) => {
    if (idx === changedIndex) {
      setMessage('Great job!');
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Color Switch</Text>
      <Text style={styles.description}>Tap the word that changed colour.</Text>
      <View style={styles.row}>
        {words.map((w, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.wordBox, { backgroundColor: colors[i] }]}
            onPress={() => handlePress(i)}
          >
            <Text style={styles.word}>{w}</Text>
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
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  wordBox: {
    minWidth: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    color: themeVariables.primaryColorDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default ColorSwitchGame;
