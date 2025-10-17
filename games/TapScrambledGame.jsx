import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const TapScrambledGame = ({ quote, onBack, onWin, onLose }) => {
  const { level } = useDifficulty();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [words, setWords] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);

  useEffect(() => {
    const limit = level === 1 ? 8 : level === 2 ? 12 : 16;
    const w = text.split(/\s+/).slice(0, limit);
    setWords(w);
    setScrambled(shuffle(w));
    setIndex(0);
    setMessage('');
    hasWonRef.current = false;
    mistakesRef.current = 0;
  }, [quote, level]);

  const handlePress = (word, idx) => {
    if (hasWonRef.current) return;
    if (word === words[index]) {
      setScrambled((prev) => prev.filter((_, i) => i !== idx));
      const next = index + 1;
      setIndex(next);
      if (next === words.length) {
        setMessage('Great job!');
        if (!hasWonRef.current) {
          hasWonRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      } else {
        setMessage('');
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Rebuild the quote</Text>
      <Text style={styles.description}>Tap the words in the correct order.</Text>
      <View style={styles.wordBank}>
        {scrambled.map((w, i) => (
          <TouchableOpacity key={`${w}-${i}`} style={styles.wordButton} onPress={() => handlePress(w, i)}>
            <Text style={styles.wordText}>{w}</Text>
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
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordButton: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  wordText: {
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

export default TapScrambledGame;
