import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../ui/components/GameTopBar';
import themeVariables from '../ui/stylesheets/theme';

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

const NextWordQuizGame = ({ quote, onBack, onWin, onLose }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);

  const generateOptions = useCallback((w, idx) => {
    if (idx >= w.length) {
      setOptions([]);
      return;
    }
    const remaining = w.slice(idx + 1).filter(word => word !== w[idx]);
    const distractors = [];
    while (distractors.length < 1 && remaining.length > 0) {
      const cand = remaining[Math.floor(Math.random() * remaining.length)];
      if (!distractors.includes(cand)) distractors.push(cand);
    }
    setOptions(shuffle([w[idx], ...distractors]));
  }, []);

  useEffect(() => {
    const w = text.split(/\s+/);
    setWords(w);
    setIndex(0);
    setMessage('');
    generateOptions(w, 0);
    hasWonRef.current = false;
    mistakesRef.current = 0;
  }, [text, generateOptions]);

  const handleSelect = word => {
    if (hasWonRef.current) return;
    if (word === words[index]) {
      const next = index + 1;
      setIndex(next);
      if (next === words.length) {
        setMessage('Great job!');
        setOptions([]);
        if (!hasWonRef.current) {
          hasWonRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      } else {
        setMessage('');
        generateOptions(words, next);
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Pick the next word</Text>
      <Text style={styles.description}>Tap the word that comes next.</Text>
      <Text style={styles.quote}>{words.slice(0, index).join(' ')}</Text>
      <View style={styles.options}>
        {options.map((o, i) => (
          <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
            <Text style={styles.optionText}>{o}</Text>
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
  quote: {
    fontSize: 24,
    marginVertical: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 6,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionText: {
    color: themeVariables.primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 24,
  },
});

export default NextWordQuizGame;
