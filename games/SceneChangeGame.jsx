import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const palette = [
  themeVariables.primaryColorLight,
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
];

// Display a line of words; one word changes colour.
const SceneChangeGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/).slice(0, 4);
  const [colors, setColors] = useState([]);
  const [changed, setChanged] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const base = palette.slice(0, words.length);
    setColors(base);
    const idx = Math.floor(Math.random() * base.length);
    setChanged(idx);
    setMessage('');
    setTimeout(() => {
      const newCols = [...base];
      const other = (idx + 2) % palette.length;
      newCols[idx] = palette[other];
      setColors(newCols);
    }, 2000);
  };

  const handlePress = (i) => {
    if (i === changed) {
      setMessage('Great job!');
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Which Scene Changed?</Text>
      <Text style={styles.description}>Tap the word that changed colour.</Text>
      <View style={styles.grid}>
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
    width: 140,
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

export default SceneChangeGame;
