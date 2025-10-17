import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const WordSwapGame = ({ quote, onBack, onWin, onLose }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/).slice(0, 8);
  const [showOriginal, setShowOriginal] = useState(true);
  const [changedIndex, setChangedIndex] = useState(0);
  const [modified, setModified] = useState([]);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);

  useEffect(() => {
    const idx = Math.floor(Math.random() * words.length);
    setChangedIndex(idx);
    const copy = [...words];
    copy[idx] = '____';
    setModified(copy);
   setShowOriginal(true);
   setMessage('');
    hasWonRef.current = false;
    mistakesRef.current = 0;
    const timer = setTimeout(() => {
      const mod = [...words];
      mod[idx] = '???';
      setModified(mod);
      setShowOriginal(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [quote]);

  const handlePress = (i) => {
    if (showOriginal || hasWonRef.current) return;
    if (i === changedIndex) {
      setMessage('Great job!');
      if (!hasWonRef.current) {
        hasWonRef.current = true;
        onWin?.({ perfect: mistakesRef.current === 0 });
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
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
