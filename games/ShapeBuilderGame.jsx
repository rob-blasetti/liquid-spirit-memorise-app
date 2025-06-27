import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

// Drag pieces (words) into their correct positions to rebuild part of the quote.
const colors = [
  themeVariables.primaryColorLight,
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
];

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const ShapeBuilderGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/).slice(0, 4);
  const [showPreview, setShowPreview] = useState(true);
  const [grid, setGrid] = useState(Array(4).fill(null)); // placed indices
  const [pieces, setPieces] = useState([]); // shuffled piece indices
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setShowPreview(true);
    setGrid(Array(4).fill(null));
    setPieces(shuffle([0, 1, 2, 3])); // indices referring to words
    setSelected(null);
    setMessage('');
    const timer = setTimeout(() => setShowPreview(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePiecePress = (p) => {
    setSelected(p);
    setMessage('');
  };

  const handleCellPress = (idx) => {
    if (showPreview || grid[idx] !== null || selected === null) return;
    if (idx === selected) {
      const next = [...grid];
      next[idx] = words[idx];
      setGrid(next);
      setPieces((prev) => prev.filter((n) => n !== selected));
      setSelected(null);
      if (next.every((c) => c !== null)) {
        setMessage('Great job!');
      }
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Shape Builder</Text>
      <Text style={styles.description}>Place each word in the right spot.</Text>
      <View style={styles.grid}>
        {grid.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.cell,
              { backgroundColor: showPreview ? colors[i] : themeVariables.whiteColor },
            ]}
            onPress={() => handleCellPress(i)}
          >
            {(showPreview || c) && <Text style={styles.word}>{words[i]}</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.pieces}>
        {pieces.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.piece,
              { backgroundColor: colors[p], opacity: selected === p ? 0.5 : 1 },
            ]}
            onPress={() => handlePiecePress(p)}
          >
            <Text style={styles.word}>{words[p]}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 160,
    height: 160,
  },
  cell: {
    width: 80,
    height: 80,
    margin: 2,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieces: {
    flexDirection: 'row',
    marginTop: 16,
  },
  piece: {
    width: 50,
    height: 50,
    margin: 4,
    borderRadius: themeVariables.borderRadiusSharp,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 16,
    color: themeVariables.primaryColorDark,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default ShapeBuilderGame;
