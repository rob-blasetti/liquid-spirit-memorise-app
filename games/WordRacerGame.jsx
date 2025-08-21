import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';
import { useDifficulty } from '../contexts/DifficultyContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAR_SIZE = 40;
const STEP = 20;

const WordRacerGame = ({ quote, onBack, onWin, onLose }) => {
  const sentence = typeof quote === 'string' ? quote : quote?.text || '';
  const { level } = useDifficulty() || { level: 1 };
  const initialLives = level === 1 ? 6 : level === 2 ? 4 : 2;
  const [car, setCar] = useState({
    x: SCREEN_WIDTH / 2 - CAR_SIZE / 2,
    y: SCREEN_HEIGHT / 2 - CAR_SIZE / 2,
  });
  const [words, setWords] = useState([]);
  const [collected, setCollected] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [message, setMessage] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    const tokens = sentence.split(/\s+/).filter(Boolean);
    const w = tokens.map((text, idx) => ({
      text,
      id: `${text}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      x: Math.random() * (SCREEN_WIDTH - 60) + 30,
      y: Math.random() * (SCREEN_HEIGHT - 200) + 100,
    }));
    setWords(w);
    setCollected([]);
    setNextIndex(0);
    setLives(initialLives);
    setMessage('');
    setCar({ x: SCREEN_WIDTH / 2 - CAR_SIZE / 2, y: SCREEN_HEIGHT / 2 - CAR_SIZE / 2 });
    initializedRef.current = true;
  }, [quote, sentence, level]);

  const checkCollision = (x, y) => {
    // Only consider one collided word at a time (closest)
    setWords((prev) => {
      let collided = null;
      let collidedIdx = -1;
      let minDist = Infinity;
      prev.forEach((w, idx) => {
        const dx = w.x - x;
        const dy = w.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30 && dist < minDist) {
          minDist = dist;
          collided = w;
          collidedIdx = idx;
        }
      });

      if (!collided) return prev;

      const expected = sentence.split(/\s+/).filter(Boolean)[nextIndex];
      if (collided.text === expected) {
        // Correct word: collect in order
        setCollected((c) => [...c, collided.text]);
        setNextIndex((i) => i + 1);
        const copy = [...prev];
        copy.splice(collidedIdx, 1);
        setMessage('');
        return copy;
      } else {
        // Wrong word: lose a life (keep words in place)
        setLives((lv) => {
          const next = Math.max(0, lv - 1);
          if (next === 0) {
            setMessage('');
            // trigger loss overlay
            onLose?.();
          } else {
            setMessage('Oops! Wrong word');
          }
          return next;
        });
        return prev;
      }
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
    // Guard initial mount where words starts empty
    if (!initializedRef.current) return;
    if (words.length === 0 && sentence && collected.length > 0) {
      onWin?.();
    }
  }, [words, sentence, onWin, collected.length]);

  const onTouchAt = (x, y) => {
    // Center the car under the finger and clamp to bounds
    const targetX = Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, x - CAR_SIZE / 2));
    const targetY = Math.max(0, Math.min(SCREEN_HEIGHT - CAR_SIZE, y - CAR_SIZE / 2));
    setCar({ x: targetX, y: targetY });
    checkCollision(targetX, targetY);
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => onTouchAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      onResponderMove={(e) => onTouchAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
    >
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      {/* Lives display */}
      <Text style={styles.lives}>Lives: {lives}</Text>
      <View style={[styles.car, { left: car.x, top: car.y }]}>
        <Text style={styles.carText}>🚗</Text>
      </View>
      {words.map((w) => (
        <Text key={w.id} style={[styles.word, { left: w.x, top: w.y }]}> 
          {w.text}
        </Text>
      ))}
      {/* Optional arrow controls retained for accessibility/debug */}
      <View style={styles.controls}>
        <ThemedButton title="↑" onPress={() => move(0, -STEP)} style={styles.controlBtn} />
        <View style={styles.horizontal}>
          <ThemedButton title="←" onPress={() => move(-STEP, 0)} style={styles.controlBtn} />
          <ThemedButton title="→" onPress={() => move(STEP, 0)} style={styles.controlBtn} />
        </View>
        <ThemedButton title="↓" onPress={() => move(0, STEP)} style={styles.controlBtn} />
      </View>
      <Text style={styles.collected}>{collected.join(' ')}</Text>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: themeVariables.whiteColor },
  lives: {
    position: 'absolute',
    top: 60,
    right: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: themeVariables.textColor,
    zIndex: 1,
  },
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
    top: 96,
    left: 20,
    right: 20,
    fontSize: 18,
    textAlign: 'center',
    color: themeVariables.textColor,
  },
  message: {
    position: 'absolute',
    top: 128,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    color: themeVariables.textColor,
  },
});

export default WordRacerGame;
