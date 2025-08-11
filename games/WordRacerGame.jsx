import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAR_SIZE = 40;
const STEP = 20;

const WordRacerGame = ({ quote, onBack, onWin }) => {
  const sentence = typeof quote === 'string' ? quote : quote?.text || '';
  const [car, setCar] = useState({
    x: SCREEN_WIDTH / 2 - CAR_SIZE / 2,
    y: SCREEN_HEIGHT / 2 - CAR_SIZE / 2,
  });
  const [words, setWords] = useState([]);
  const [collected, setCollected] = useState([]);

  useEffect(() => {
    const w = sentence.split(/\s+/).map((text) => ({
      text,
      x: Math.random() * (SCREEN_WIDTH - 60) + 30,
      y: Math.random() * (SCREEN_HEIGHT - 200) + 100,
    }));
    setWords(w);
    setCollected([]);
    setCar({ x: SCREEN_WIDTH / 2 - CAR_SIZE / 2, y: SCREEN_HEIGHT / 2 - CAR_SIZE / 2 });
  }, [quote, sentence]);

  const checkCollision = (x, y) => {
    setWords((prev) => {
      const remaining = [];
      const newlyCollected = [];
      prev.forEach((w) => {
        if (Math.abs(w.x - x) < 30 && Math.abs(w.y - y) < 30) {
          newlyCollected.push(w.text);
        } else {
          remaining.push(w);
        }
      });
      if (newlyCollected.length) {
        setCollected((c) => [...c, ...newlyCollected]);
      }
      return remaining;
    });
  };

  const move = (dx, dy) => {
    setCar((prev) => {
      const nx = Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, prev.x + dx));
      const ny = Math.max(0, Math.min(SCREEN_HEIGHT - CAR_SIZE, prev.y + dy));
      checkCollision(nx, ny);
      return { x: nx, y: ny };
    });
  };

  useEffect(() => {
    if (words.length === 0 && sentence) {
      onWin?.();
    }
  }, [words, sentence, onWin]);

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <View style={[styles.car, { left: car.x, top: car.y }]}>
        <Text style={styles.carText}>🚗</Text>
      </View>
      {words.map((w) => (
        <Text key={w.text + w.x} style={[styles.word, { left: w.x, top: w.y }]}> 
          {w.text}
        </Text>
      ))}
      <View style={styles.controls}>
        <ThemedButton title="↑" onPress={() => move(0, -STEP)} style={styles.controlBtn} />
        <View style={styles.horizontal}>
          <ThemedButton title="←" onPress={() => move(-STEP, 0)} style={styles.controlBtn} />
          <ThemedButton title="→" onPress={() => move(STEP, 0)} style={styles.controlBtn} />
        </View>
        <ThemedButton title="↓" onPress={() => move(0, STEP)} style={styles.controlBtn} />
      </View>
      <Text style={styles.collected}>{collected.join(' ')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeVariables.whiteColor },
  car: {
    position: 'absolute',
    width: CAR_SIZE,
    height: CAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carText: { fontSize: 32 },
  word: { position: 'absolute', fontSize: 16, color: themeVariables.textColor },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  horizontal: { flexDirection: 'row', marginVertical: 8 },
  controlBtn: { minWidth: 60, marginHorizontal: 10 },
  collected: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    fontSize: 18,
    textAlign: 'center',
    color: themeVariables.textColor,
  },
});

export default WordRacerGame;
