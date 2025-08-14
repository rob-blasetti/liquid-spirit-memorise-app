import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FlashCardRecallGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [showQuote, setShowQuote] = useState(true);
  const [words, setWords] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setShowQuote(true);
    const w = text.split(/\s+/);
    setWords(w);
    setScrambled(shuffle(w));
    setIndex(0);
    setMessage('');
    const timer = setTimeout(() => setShowQuote(false), 6000);
    return () => clearTimeout(timer);
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
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Flash Card Recall</Text>
      <Text style={styles.description}>Look at the quote, then tap the words in order.</Text>
      {showQuote ? (
        <Text style={styles.quote}>{text}</Text>
      ) : (
        <>
          <View style={styles.wordBank}>
            {scrambled.map((w, i) => (
              <TouchableOpacity key={`${w}-${i}`} style={styles.wordButton} onPress={() => handlePress(w, i)}>
                <Text style={styles.wordText}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      )}
      {/* back handled via header icon */}
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
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 20,
    marginVertical: 24,
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

export default FlashCardRecallGame;
