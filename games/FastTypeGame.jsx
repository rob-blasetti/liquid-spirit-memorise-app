import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { prepareQuoteForGame, pickUniqueWords, sanitizeQuoteText } from '../services/quoteSanitizer';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FastTypeGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  const entries = quoteData.entries;
  const words = useMemo(
    () => entries.map((entry) => entry.original || entry.clean || ''),
    [entries],
  );
  const [time, setTime] = useState(30);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const outcomeResolvedRef = useRef(false);
  const mistakesRef = useRef(0);
  const canonicalize = (value) =>
    sanitizeQuoteText(typeof value === 'string' ? value : '').toLocaleLowerCase();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIndex(0);
    setMessage('');
    setTime(30);
    generateOptions(entries, 0);
    outcomeResolvedRef.current = false;
    mistakesRef.current = 0;
    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quote]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (time === 0 && message === '') {
      setMessage("Time's up!");
      setOptions([]);
      if (!outcomeResolvedRef.current) {
        outcomeResolvedRef.current = true;
        onLose?.();
      }
    }
  }, [time, message, onLose]);

  const generateOptions = (entryList, idx) => {
    if (idx >= entryList.length) {
      setOptions([]);
      return;
    }
    const entry = entryList[idx];
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffle([entry.original || entry.clean || '', ...distractors]));
  };

  const handleSelect = (word) => {
    if (time === 0 || outcomeResolvedRef.current) return;
    const current = entries[index];
    if (!current) return;
    const expectedCanonical = canonicalize(current.original || current.clean || '');
    if (canonicalize(word) === expectedCanonical) {
      const next = index + 1;
      setIndex(next);
      if (next === entries.length) {
        setMessage('Great job!');
        setOptions([]);
        if (!outcomeResolvedRef.current) {
          outcomeResolvedRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      } else {
        setMessage('');
        generateOptions(entries, next);
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Tap It Fast</Text>
      <Text style={styles.description}>Tap each word in order before time runs out!</Text>
      <Text style={styles.timer}>Time: {time}</Text>
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
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 18,
    marginBottom: 8,
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

export default FastTypeGame;
