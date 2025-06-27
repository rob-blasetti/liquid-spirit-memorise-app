import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const WordSwapGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/).slice(0, 8);
  const [showOriginal, setShowOriginal] = useState(true);
  const [changedIndex, setChangedIndex] = useState(0);
  const [modified, setModified] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const idx = Math.floor(Math.random() * words.length);
    setChangedIndex(idx);
    const copy = [...words];
    copy[idx] = '____';
    setModified(copy);
    setShowOriginal(true);
    setMessage('');
    const timer = setTimeout(() => {
      const mod = [...words];
      mod[idx] = '???';
      setModified(mod);
      setShowOriginal(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [quote]);

  const handlePress = (i) => {
    if (showOriginal) return;
    if (i === changedIndex) {
      setMessage('Great job!');
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Word Swap</Text>
      <Text style={styles.description}>Tap the word that changed.</Text>
      <View style={styles.sentence}>
        {modified.map((w, i) => (
          <TouchableOpacity key={i} onPress={() => handlePress(i)}>
            <Text style={styles.word}>{w} </Text>
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
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  word: {
    fontSize: 20,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default WordSwapGame;
