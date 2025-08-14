import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const scrambleWord = (word) => {
  if (word.length <= 1) return word;
  const letters = word.split('');
  const first = letters.shift();
  return first + shuffle(letters).join('');
};

const LetterScrambleGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIndex(0);
    setMessage('');
    setScrambled(scrambleWord(words[0]));
    generateOptions(words[0]);
  }, [quote]);

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex < words.length) {
      setScrambled(scrambleWord(words[nextIndex]));
    }
    setIndex(nextIndex);
    generateOptions(words[nextIndex]);
  };

  const generateOptions = (word) => {
    const remaining = words.filter(w => w !== word);
    const distractors = [];
    while (distractors.length < 3 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    while (distractors.length < 3) {
      distractors.push(words[Math.floor(Math.random() * words.length)]);
    }
    setOptions(shuffle([word, ...distractors]));
  };

  const handleSelect = (choice) => {
    if (choice.toLowerCase() === words[index].toLowerCase()) {
      if (index + 1 === words.length) {
        setIndex(index + 1);
        setMessage('Great job!');
        setOptions([]);
      } else {
        setMessage('');
        next();
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Unscramble Letters</Text>
      <Text style={styles.description}>Unscramble each word. The first letter stays in place.</Text>
      {index < words.length ? (
        <>
          <Text style={styles.quote}>{scrambled}</Text>
          <View style={styles.options}>
            {options.map((o, i) => (
              <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
                <Text style={styles.optionText}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
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
    fontSize: 28,
    marginVertical: 24,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
});

export default LetterScrambleGame;
