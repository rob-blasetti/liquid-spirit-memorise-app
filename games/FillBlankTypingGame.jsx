import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { prepareQuoteForGame, pickUniqueWords, sanitizeQuoteText } from '../services/quoteSanitizer';

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const FillBlankTypingGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  const entries = quoteData.entries;
  const words = useMemo(
    () => entries.map((entry) => entry.original || entry.clean || ''),
    [entries],
  );
  const playableEntries = quoteData.playableEntries;
  const playableMap = useMemo(() => {
    const map = new Map();
    playableEntries.forEach((entry) => map.set(entry.index, entry));
    return map;
  }, [playableEntries]);
  const [missing, setMissing] = useState([]);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);
  const canonicalize = (value) =>
    sanitizeQuoteText(typeof value === 'string' ? value : '').toLocaleLowerCase();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const totalEntries = entries.length;
    const num = Math.min(3, Math.max(1, Math.floor(totalEntries / 8)));
    const playableIndices = playableEntries.map((entry) => entry.index);
    const indices = [];
    while (indices.length < num && playableIndices.length > 0) {
      const pickIdx = Math.floor(Math.random() * playableIndices.length);
      const value = playableIndices.splice(pickIdx, 1)[0];
      if (!indices.includes(value)) indices.push(value);
    }
    const sorted = indices.sort((a, b) => a - b);
    setMissing(sorted);
    setCurrent(0);
    setMessage('');
    generateOptions(words, sorted, 0);
    hasWonRef.current = false;
    mistakesRef.current = 0;
  }, [quote]);

  const generateOptions = (arr, indices, idx) => {
    if (idx >= indices.length) {
      setOptions([]);
      return;
    }
    const word = arr[indices[idx]];
    const entry = playableMap.get(indices[idx]);
    if (!entry) {
      setOptions([]);
      return;
    }
    const exclude = new Set([entry.canonical || entry.clean]);
    const distractors = pickUniqueWords(quoteData.uniquePlayableWords, 3, exclude).map(
      ({ entry: e }) => e.original || e.clean || '',
    );
    setOptions(shuffle([word, ...distractors]));
  };

  const handleSelect = (word) => {
    if (hasWonRef.current) return;
    const idx = missing[current];
    const entry = playableMap.get(idx);
    if (!entry) return;
    const expectedCanonical = canonicalize(entry.original || entry.clean || '');
    if (canonicalize(word) === expectedCanonical) {
      const next = current + 1;
      setCurrent(next);
      if (next === missing.length) {
        setMessage('Great job!');
        setOptions([]);
        if (!hasWonRef.current) {
          hasWonRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      } else {
        setMessage('Correct!');
        generateOptions(words, missing, next);
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  const display = words.map((w, i) => {
    if (missing.includes(i)) {
      if (missing.indexOf(i) < current) return w;
      return '_'.repeat(w.length);
    }
    return w;
  }).join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Fill in the Blank</Text>
      <Text style={styles.description}>Tap the words that fit in the blanks.</Text>
      <Text style={styles.quote}>{display}</Text>
      {current < missing.length && (
        <View style={styles.options}>
          {options.map((o, i) => (
            <TouchableOpacity key={`${o}-${i}`} style={styles.optionButton} onPress={() => handleSelect(o)}>
              <Text style={styles.optionText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
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
    marginBottom: 16,
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
    marginBottom: 8,
  },
});

export default FillBlankTypingGame;
