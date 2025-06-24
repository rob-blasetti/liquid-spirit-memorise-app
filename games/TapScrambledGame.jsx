import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const TapScrambledGame = ({ quote, onBack }) => {
  const [words, setWords] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const w = quote.split(/\s+/).slice(0, 8);
    setWords(w);
    setScrambled(shuffle(w));
    setIndex(0);
    setMessage('');
  }, [quote]);

  const handlePress = (word, idx) => {
    if (word === words[index]) {
      setScrambled((prev) => prev.filter((_, i) => i !== idx));
      const next = index + 1;
      setIndex(next);
      if (next === words.length) {
        setMessage('Great job!');
      } else {
        setMessage('');
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
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
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordButton: {
    backgroundColor: themeVariables.secondaryLightColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  wordText: {
    fontSize: 18,
    color: themeVariables.whiteColor,
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
