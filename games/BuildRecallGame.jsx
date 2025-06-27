import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

// Show a short sequence of words from the quote. After the preview,
// players tap the words in the same order to reinforce recall.
const BuildRecallGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/).slice(0, 3);
  const [sequence, setSequence] = useState([]); // order to memorize
  const [showIndex, setShowIndex] = useState(0); // playback index
  const [userIndex, setUserIndex] = useState(0); // player progress
  const [highlight, setHighlight] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    // pick a random order of the words to show
    const seq = shuffle([0, 1, 2]);
    setSequence(seq);
    setShowIndex(0);
    setUserIndex(0);
    setMessage('');
  };

  useEffect(() => {
    if (showIndex < sequence.length) {
      const idx = sequence[showIndex];
      setTimeout(() => {
        setHighlight(idx);
        setTimeout(() => {
          setHighlight(null);
          setShowIndex((p) => p + 1);
        }, 400);
      }, 600);
    }
  }, [showIndex, sequence]);

  const handlePress = (idx) => {
    if (showIndex < sequence.length) return;
    if (sequence[userIndex] === idx) {
      const next = userIndex + 1;
      setUserIndex(next);
      if (next === sequence.length) {
        setMessage('Great job!');
      }
    } else {
      setMessage('Try again');
      startRound();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Build & Recall</Text>
      <Text style={styles.description}>Watch the word order then repeat it.</Text>
      <View style={styles.row}>
        {words.map((w, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.block, highlight === i && styles.highlight]}
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
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  block: {
    minWidth: 70,
    paddingVertical: 16,
    paddingHorizontal: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: themeVariables.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    backgroundColor: themeVariables.primaryColorLight,
  },
  word: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default BuildRecallGame;
