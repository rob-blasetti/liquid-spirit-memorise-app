import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const size = 3;
const path = ['R', 'D', 'D', 'R'];

// During the preview, highlight the path across a grid of words from the quote.
// The player then moves along the grid from memory using the arrow buttons.
const MemoryMazeGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/).slice(0, size * size);
  const [preview, setPreview] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPreview(true);
    setPos({ x: 0, y: 0 });
    setStep(0);
    setMessage('');
    const timer = setTimeout(() => setPreview(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const move = (dir) => {
    if (preview || message) return;
    const expected = path[step];
    if (dir !== expected) {
      setMessage('Try again');
      return;
    }
    const next = { ...pos };
    if (dir === 'R') next.x += 1;
    if (dir === 'L') next.x -= 1;
    if (dir === 'U') next.y -= 1;
    if (dir === 'D') next.y += 1;
    setPos(next);
    const newStep = step + 1;
    if (newStep === path.length) {
      setMessage('Great job!');
    } else {
      setStep(newStep);
    }
  };

  const renderCell = (x, y, index) => {
    let bg = themeVariables.whiteColor;
    if (preview) {
      const idx = path.findIndex((d, i) => {
        let px = 0, py = 0;
        for (let j = 0; j <= i; j++) {
          const d2 = path[j];
          if (d2 === 'R') px += 1;
          if (d2 === 'L') px -= 1;
          if (d2 === 'U') py -= 1;
          if (d2 === 'D') py += 1;
        }
        return px === x && py === y;
      });
      if (x === 0 && y === 0) bg = '#6bcb77';
      else if (idx !== -1) bg = '#ffd93d';
      else if (x === size - 1 && y === size - 1) bg = '#4d96ff';
    } else {
      if (pos.x === x && pos.y === y) bg = '#6bcb77';
      if (x === size - 1 && y === size - 1) bg = '#4d96ff';
    }
    const word = words[index] || '';
    return (
      <View key={index} style={[styles.cell, { backgroundColor: bg }]}>\
        <Text style={styles.word}>{word}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Memory Maze</Text>
      <Text style={styles.description}>Navigate to the goal from memory.</Text>
      <View style={styles.grid}>
        {Array.from({ length: size }).map((_, y) => (
          <View key={y} style={styles.row}>
            {Array.from({ length: size }).map((_, x) =>
              renderCell(x, y, `${x}-${y}`),
            )}
          </View>
        ))}
      </View>
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => move('U')} style={styles.controlBtn}>
            <Text>U</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => move('L')} style={styles.controlBtn}>
            <Text>L</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => move('D')} style={styles.controlBtn}>
            <Text>D</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => move('R')} style={styles.controlBtn}>
            <Text>R</Text>
          </TouchableOpacity>
        </View>
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
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  word: {
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    marginVertical: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlBtn: {
    backgroundColor: themeVariables.whiteColor,
    padding: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default MemoryMazeGame;
