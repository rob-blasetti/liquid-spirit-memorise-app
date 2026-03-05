import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../../ui/components/GameTopBar';
import themeVariables from '../../ui/stylesheets/theme';

const PALETTE = [
  { key: 'sun', label: 'Sun', color: '#f9c74f' },
  { key: 'sky', label: 'Sky', color: '#4ea8de' },
  { key: 'leaf', label: 'Leaf', color: '#6ab04c' },
  { key: 'heart', label: 'Heart', color: '#e05656' },
  { key: 'violet', label: 'Violet', color: '#9b59b6' },
  { key: 'ocean', label: 'Ocean', color: '#1f78b4' },
];

const normalizeWords = (quote) => {
  const raw = typeof quote === 'string' ? quote : quote?.text || '';
  return raw
    .split(/\s+/)
    .map((word) => word.trim())
    .map((word) => word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ''))
    .filter(Boolean);
};

const uniqueWords = (words = []) => {
  const seen = new Set();
  const out = [];
  words.forEach((word) => {
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  return out;
};

const getWordCountForLevel = (level) => {
  if (level >= 3) return 6;
  if (level === 2) return 5;
  return 4;
};

const ColorQuoteGame = ({ quote, onBack, onWin, level = 1 }) => {
  const words = useMemo(() => normalizeWords(quote), [quote]);
  const targets = useMemo(() => {
    const count = getWordCountForLevel(level);
    return uniqueWords(words).slice(0, count);
  }, [words, level]);

  const colorMap = useMemo(() => {
    const map = {};
    targets.forEach((word, index) => {
      map[word.toLowerCase()] = PALETTE[index % PALETTE.length];
    });
    return map;
  }, [targets]);

  const [selectedColorKey, setSelectedColorKey] = useState(PALETTE[0].key);
  const [painted, setPainted] = useState({});
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Pick a colour, then tap a word tile to paint it.');
  const [completed, setCompleted] = useState(false);

  const selectedColor = PALETTE.find((entry) => entry.key === selectedColorKey) || PALETTE[0];

  const handlePaint = (word) => {
    if (completed) return;
    const lower = word.toLowerCase();
    const expected = colorMap[lower];
    if (!expected) return;

    if (selectedColor.key !== expected.key) {
      setMistakes((value) => value + 1);
      setMessage(`Try again: “${word}” is ${expected.label}.`);
      return;
    }

    const nextPainted = { ...painted, [lower]: true };
    setPainted(nextPainted);
    setMessage(`Nice! “${word}” painted ${expected.label}.`);

    const allDone = targets.every((target) => nextPainted[target.toLowerCase()]);
    if (allDone) {
      setCompleted(true);
      setMessage('Beautiful! You coloured the quote correctly.');
      onWin?.({ perfect: mistakes === 0 });
    }
  };

  const paintedCount = targets.filter((target) => painted[target.toLowerCase()]).length;

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />

      <Text style={styles.title}>Colour the Quote</Text>
      <Text style={styles.subtitle}>Paint each word tile with its matching colour.</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Progress: {paintedCount}/{targets.length}</Text>
        <Text style={styles.progressText}>Mistakes: {mistakes}</Text>
      </View>

      <View style={styles.paletteRow}>
        {PALETTE.slice(0, Math.max(targets.length, 4)).map((entry) => {
          const active = entry.key === selectedColor.key;
          return (
            <TouchableOpacity
              key={entry.key}
              onPress={() => setSelectedColorKey(entry.key)}
              style={[styles.swatch, { backgroundColor: entry.color }, active && styles.swatchActive]}
            >
              <Text style={styles.swatchLabel}>{entry.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.board}>
        {targets.map((word) => {
          const lower = word.toLowerCase();
          const done = Boolean(painted[lower]);
          const expected = colorMap[lower];
          return (
            <TouchableOpacity
              key={lower}
              onPress={() => handlePaint(word)}
              style={[styles.wordTile, done && { backgroundColor: expected.color, borderColor: expected.color }]}
            >
              <Text style={[styles.wordText, done && styles.wordTextDone]}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Hint: each word has one correct colour.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    color: themeVariables.whiteColor,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 14,
    color: themeVariables.whiteColor,
    textAlign: 'center',
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    color: themeVariables.whiteColor,
    fontSize: 13,
    fontWeight: '600',
  },
  paletteRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  swatch: {
    minWidth: 78,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  swatchActive: {
    borderColor: '#ffffff',
  },
  swatchLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  board: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  wordTile: {
    minWidth: 110,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  wordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  wordTextDone: {
    color: '#fff',
  },
  message: {
    marginTop: 4,
    color: themeVariables.whiteColor,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default ColorQuoteGame;
