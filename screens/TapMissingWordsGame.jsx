import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';

const TapMissingWordsGame = ({ quote, onBack }) => {
  const [displayWords, setDisplayWords] = useState([]);
  const [missingWords, setMissingWords] = useState([]);
  const [missingIndices, setMissingIndices] = useState([]);
  const [wordBank, setWordBank] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const words = quote.split(' ');
    const numBlanks = Math.min(4, Math.max(1, Math.floor(words.length / 6)));
    const indices = [];
    while (indices.length < numBlanks) {
      const idx = Math.floor(Math.random() * words.length);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    indices.sort((a, b) => a - b);
    const missing = indices.map(i => words[i]);
    const display = words.map((w, i) => (indices.includes(i) ? '____' : w));
    const bank = [...missing].sort(() => Math.random() - 0.5);

    setDisplayWords(display);
    setMissingWords(missing);
    setMissingIndices(indices);
    setWordBank(bank);
    setCurrentIndex(0);
    setMessage('');
  }, [quote]);

  const handleWordPress = word => {
    if (word === missingWords[currentIndex]) {
      const newDisplay = [...displayWords];
      newDisplay[missingIndices[currentIndex]] = word;
      setDisplayWords(newDisplay);
      setWordBank(prev => prev.filter(w => w !== word));
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex === missingWords.length) {
        setMessage('Well done!');
      } else {
        setMessage('');
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fill in the missing words</Text>
      <Text style={styles.quote}>{displayWords.join(' ')}</Text>
      <View style={styles.wordBank}>
        {wordBank.map(word => (
          <TouchableOpacity
            key={word}
            style={styles.wordButton}
            onPress={() => handleWordPress(word)}
          >
            <Text style={styles.wordText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} />
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
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 24,
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

export default TapMissingWordsGame;
