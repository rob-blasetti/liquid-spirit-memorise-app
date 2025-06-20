import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

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
    const w = quote.split(/\s+/);
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
      <Text style={styles.title}>Rebuild the quote</Text>
      <View style={styles.wordBank}>
        {scrambled.map((w, i) => (
          <TouchableOpacity key={`${w}-${i}`} style={styles.wordButton} onPress={() => handlePress(w, i)}>
            <Text style={styles.wordText}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    margin: 4,
    borderRadius: 4,
  },
  wordText: {
    fontSize: 16,
  },
  message: {
    fontSize: 16,
    color: '#e52f2f',
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default TapScrambledGame;
