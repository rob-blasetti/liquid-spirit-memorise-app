import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { useDifficulty } from '../contexts/DifficultyContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAR_SIZE = 40;
const TOP_PLAY_PADDING = 150;
const BOTTOM_PLAY_PADDING = 160;
const WORD_MARGIN = 40;
const MIN_WORD_RADIUS = 32;
const MAX_WORD_RADIUS = 56;
const WORD_OVERLAP_BUFFER = 12;
const CAR_SPAWN_BUFFER = 96;
const PLAY_AREA_TOP = TOP_PLAY_PADDING;
const PLAY_AREA_BOTTOM_EDGE = SCREEN_HEIGHT - BOTTOM_PLAY_PADDING;
const CAR_BOTTOM_BOUND = Math.max(PLAY_AREA_TOP, PLAY_AREA_BOTTOM_EDGE - CAR_SIZE);
const clampCarX = (value) => Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, value));
const clampCarY = (value) => Math.max(PLAY_AREA_TOP, Math.min(CAR_BOTTOM_BOUND, value));
const clampWordCenterX = (value, radius) =>
  Math.max(radius + WORD_MARGIN, Math.min(SCREEN_WIDTH - radius - WORD_MARGIN, value));
const clampWordCenterY = (value, radius) =>
  Math.max(PLAY_AREA_TOP + radius, Math.min(PLAY_AREA_BOTTOM_EDGE - radius, value));
const computeWordRadius = (text) =>
  Math.min(MAX_WORD_RADIUS, Math.max(MIN_WORD_RADIUS, text.length * 3 + 18));

const WordRacerGame = ({ quote, onBack, onWin, onLose }) => {
  const sentence = typeof quote === 'string' ? quote : quote?.text || '';
  const { level } = useDifficulty() || { level: 1 };
  const initialLives = level === 1 ? 6 : level === 2 ? 4 : 2;
  const [car, setCar] = useState(() => {
    const initialX = clampCarX(SCREEN_WIDTH / 2 - CAR_SIZE / 2);
    const initialY = clampCarY((PLAY_AREA_TOP + CAR_BOTTOM_BOUND) / 2);
    return { x: initialX, y: initialY };
  });
  const [words, setWords] = useState([]);
  const [collected, setCollected] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [message, setMessage] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    const tokens = sentence.split(/\s+/).filter(Boolean);
    const startX = clampCarX(SCREEN_WIDTH / 2 - CAR_SIZE / 2);
    const startY = clampCarY((PLAY_AREA_TOP + CAR_BOTTOM_BOUND) / 2);
    const carCenterX = startX + CAR_SIZE / 2;
    const carCenterY = startY + CAR_SIZE / 2;
    const isClearOfCar = (cx, cy, radius) => {
      const dx = carCenterX - cx;
      const dy = carCenterY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist >= radius + CAR_SPAWN_BUFFER;
    };
    const placed = [];
    const overlapsPlaced = (cx, cy, radius) =>
      placed.some((p) => {
        const dx = p.cx - cx;
        const dy = p.cy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < p.radius + radius + WORD_OVERLAP_BUFFER;
      });
    const generated = tokens.map((text, idx) => {
      const radius = computeWordRadius(text);
      const id = `${text}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
      const minX = WORD_MARGIN + radius;
      const maxX = SCREEN_WIDTH - WORD_MARGIN - radius;
      const minY = PLAY_AREA_TOP + radius;
      const maxY = PLAY_AREA_BOTTOM_EDGE - radius;
      let candidate = null;
      if (minX <= maxX && minY <= maxY) {
        const attempts = 80;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          const cx = minX + Math.random() * (maxX - minX);
          const cy = minY + Math.random() * (maxY - minY);
          if (!isClearOfCar(cx, cy, radius)) continue;
          if (!overlapsPlaced(cx, cy, radius)) {
            candidate = { text, id, cx, cy, radius };
            break;
          }
        }
      }
      if (!candidate) {
        const fallbackOffsets = [
          { x: radius + CAR_SPAWN_BUFFER, y: 0 },
          { x: -(radius + CAR_SPAWN_BUFFER), y: 0 },
          { x: 0, y: radius + CAR_SPAWN_BUFFER },
          { x: 0, y: -(radius + CAR_SPAWN_BUFFER) },
          { x: radius + CAR_SPAWN_BUFFER, y: radius + CAR_SPAWN_BUFFER },
          { x: -(radius + CAR_SPAWN_BUFFER), y: radius + CAR_SPAWN_BUFFER },
          { x: radius + CAR_SPAWN_BUFFER, y: -(radius + CAR_SPAWN_BUFFER) },
          { x: -(radius + CAR_SPAWN_BUFFER), y: -(radius + CAR_SPAWN_BUFFER) },
        ];
        for (let i = 0; i < fallbackOffsets.length && !candidate; i += 1) {
          const offset = fallbackOffsets[i];
          const cx = clampWordCenterX(carCenterX + offset.x, radius);
          const cy = clampWordCenterY(carCenterY + offset.y, radius);
          if (!isClearOfCar(cx, cy, radius)) continue;
          if (!overlapsPlaced(cx, cy, radius)) {
            candidate = { text, id, cx, cy, radius };
          }
        }
      }
      if (!candidate) {
        const fallbackCx = clampWordCenterX(SCREEN_WIDTH / 2, radius);
        const fallbackCy = clampWordCenterY(
          (PLAY_AREA_TOP + PLAY_AREA_BOTTOM_EDGE) / 2,
          radius,
        );
        let cx = fallbackCx;
        let cy = fallbackCy;
        const extraOffsets = [
          { x: radius + CAR_SPAWN_BUFFER, y: 0 },
          { x: -(radius + CAR_SPAWN_BUFFER), y: 0 },
          { x: 0, y: radius + CAR_SPAWN_BUFFER },
          { x: 0, y: -(radius + CAR_SPAWN_BUFFER) },
        ];
        for (let i = 0; i < extraOffsets.length; i += 1) {
          const option = extraOffsets[i];
          const testCx = clampWordCenterX(fallbackCx + option.x, radius);
          const testCy = clampWordCenterY(fallbackCy + option.y, radius);
          if (!isClearOfCar(testCx, testCy, radius)) continue;
          if (!overlapsPlaced(testCx, testCy, radius)) {
            cx = testCx;
            cy = testCy;
            break;
          }
        }
        if (!isClearOfCar(cx, cy, radius)) {
          cx = clampWordCenterX(carCenterX + radius + CAR_SPAWN_BUFFER, radius);
          cy = clampWordCenterY(carCenterY + radius + CAR_SPAWN_BUFFER, radius);
        }
        if (overlapsPlaced(cx, cy, radius)) {
          const altCy = clampWordCenterY(cy + radius + WORD_OVERLAP_BUFFER, radius);
          if (isClearOfCar(cx, altCy, radius) && !overlapsPlaced(cx, altCy, radius)) {
            cy = altCy;
          }
        }
        candidate = { text, id, cx, cy, radius };
      }
      placed.push(candidate);
      return candidate;
    });
    setWords(generated);
    setCollected([]);
    setNextIndex(0);
    setLives(initialLives);
    setMessage('');
    setCar({ x: startX, y: startY });
    initializedRef.current = true;
  }, [quote, sentence, level]);

  const checkCollision = (x, y) => {
    const carCenterX = x + CAR_SIZE / 2;
    const carCenterY = y + CAR_SIZE / 2;
    // Only consider one collided word at a time (closest)
    setWords((prev) => {
      let collided = null;
      let collidedIdx = -1;
      let minDist = Infinity;
      prev.forEach((w, idx) => {
        const dx = w.cx - carCenterX;
        const dy = w.cy - carCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < w.radius && dist < minDist) {
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
      }
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
    const clampedX = clampCarX(targetX);
    const clampedY = clampCarY(targetY);
    setCar({ x: clampedX, y: clampedY });
    checkCollision(clampedX, clampedY);
  };

  return (
    <View style={styles.container}>
      <GameTopBar
        onBack={onBack}
        variant="whiteShadow"
        preserveLeftPlaceholder
        preserveRightPlaceholder
        title="Word Racer"
        titleStyle={styles.navTitle}
      />
      <View
        style={styles.playArea}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => onTouchAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
        onResponderMove={(e) => onTouchAt(e.nativeEvent.locationX, e.nativeEvent.locationY)}
      >
        <View pointerEvents="box-none" style={styles.topOverlay}>
          <View pointerEvents="none" style={styles.tray}>
            <Text style={styles.trayLabel}>Collected Words</Text>
            <Text style={styles.trayText}>
              {collected.length > 0 ? collected.join(' ') : 'Glide to grab each word in order'}
            </Text>
          </View>
        </View>
        <View style={[styles.car, { left: car.x, top: car.y }]}>
          <Text style={styles.carText}>🚗</Text>
        </View>
        {words.map((w) => (
          <View
            key={w.id}
            style={[
              styles.wordBubble,
              {
                left: w.cx - w.radius,
                top: w.cy - w.radius,
                width: w.radius * 2,
                height: w.radius * 2,
                borderRadius: w.radius,
              },
            ]}
          >
            <Text
              style={styles.wordText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {w.text}
            </Text>
          </View>
        ))}
        <View style={styles.livesFooter}>
          <View style={styles.livesBadge}>
            <Text style={styles.livesText}>Lives {lives}</Text>
          </View>
        </View>
        {message !== '' && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  playArea: { flex: 1 },
  navTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: themeVariables.whiteColor,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  topOverlay: {
    position: 'absolute',
    top: PLAY_AREA_TOP - 60,
    left: 24,
    right: 24,
  },
  livesBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  livesText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tray: {
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  trayLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 4,
  },
  trayText: {
    fontSize: 20,
    color: themeVariables.whiteColor,
    fontWeight: '500',
  },
  car: {
    position: 'absolute',
    width: CAR_SIZE,
    height: CAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carText: { fontSize: 32 },
  wordBubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  wordText: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  livesFooter: {
    position: 'absolute',
    left: 24,
    bottom: 54,
  },
  message: {
    position: 'absolute',
    top: PLAY_AREA_TOP + 36,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    color: themeVariables.whiteColor,
  },
});

export default WordRacerGame;
