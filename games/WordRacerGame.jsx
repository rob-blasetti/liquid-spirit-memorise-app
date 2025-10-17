import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
import { useDifficulty } from '../contexts/DifficultyContext';
import { prepareQuoteForGame, getEntryDisplayWord } from '../services/quoteSanitizer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAR_SIZE = 40;
const TOP_PLAY_PADDING = 150;
const BOTTOM_PLAY_PADDING = 160;
const WORD_MARGIN = 32;
const MIN_WORD_RADIUS = 24;
const MAX_WORD_RADIUS = 44;
const WORD_OVERLAP_BUFFER = 8;
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
  Math.min(MAX_WORD_RADIUS, Math.max(MIN_WORD_RADIUS, text.length * 2.5 + 14));

const WordRacerGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  const uniquePlayableEntries = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    quoteData.playableEntries.forEach((entry) => {
      const key = entry.canonical || entry.clean || entry.original;
      if (!key || seen.has(key)) return;
      seen.add(key);
      ordered.push(entry);
    });
    return ordered;
  }, [quoteData.playableEntries]);
  const playableWords = useMemo(
    () => uniquePlayableEntries.map((entry) => getEntryDisplayWord(entry)),
    [uniquePlayableEntries],
  );
  const matchKeys = useMemo(
    () =>
      uniquePlayableEntries.map(
        (entry) => entry.canonical || entry.clean || entry.original || getEntryDisplayWord(entry),
      ),
    [uniquePlayableEntries],
  );
  const playableIndexSet = useMemo(
    () => new Set(uniquePlayableEntries.map((entry) => entry.index)),
    [uniquePlayableEntries],
  );
  const [collectedKeys, setCollectedKeys] = useState([]);
  const collectedKeySet = useMemo(() => new Set(collectedKeys), [collectedKeys]);
  const quoteProgress = useMemo(() => {
    if (!quoteData.entries || quoteData.entries.length === 0) return '';
    return quoteData.entries
      .map((entry) => {
        const original = entry.original ?? entry.clean ?? '';
        const displayWord = getEntryDisplayWord(entry);
        const key = entry.canonical || entry.clean || entry.original || displayWord;
        if (!playableIndexSet.has(entry.index)) {
          return original;
        }
        if (collectedKeySet.has(key)) {
          return original;
        }
        const trailingMatch = original.match(/[^A-Za-z0-9]+$/);
        const trailing = trailingMatch ? trailingMatch[0] : '';
        const effectiveBaseLength =
          displayWord.length || Math.max(original.length - trailing.length, 1);
        const length = Math.max(effectiveBaseLength, 2);
        const placeholder = '_'.repeat(Math.min(length, 18));
        return `${placeholder}${trailing}`;
      })
      .join(' ');
  }, [quoteData.entries, playableIndexSet, collectedKeySet]);
  const instructionsOpacity = useRef(new Animated.Value(1)).current;
  const instructionsTimerRef = useRef(null);
  const [instructionsDismissed, setInstructionsDismissed] = useState(false);
  const { level } = useDifficulty() || { level: 1 };
  const initialLives = level === 1 ? 6 : level === 2 ? 4 : 2;
  const [car, setCar] = useState(() => {
    const initialX = clampCarX(SCREEN_WIDTH / 2 - CAR_SIZE / 2);
    const initialY = clampCarY((PLAY_AREA_TOP + CAR_BOTTOM_BOUND) / 2);
    return { x: initialX, y: initialY };
  });
  const [words, setWords] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [message, setMessage] = useState('');
  const initializedRef = useRef(false);
  const pendingLoseRef = useRef(false);
  const [showGestureCue, setShowGestureCue] = useState(false);
  const gestureOpacity = useRef(new Animated.Value(0)).current;
  const gesturePosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const gestureTimeoutRef = useRef(null);
  const gestureLoopRef = useRef(null);
  const gestureActiveRef = useRef(false);
  const showGestureRef = useRef(false);
  const gestureAnchorRef = useRef({ x: 0, y: 0 });
  const matchKeyRef = useRef([]);

  const dismissInstructions = useCallback(() => {
    if (instructionsDismissed) return;
    if (instructionsTimerRef.current) {
      clearTimeout(instructionsTimerRef.current);
      instructionsTimerRef.current = null;
    }
    Animated.timing(instructionsOpacity, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setInstructionsDismissed(true);
      }
    });
  }, [instructionsDismissed, instructionsOpacity]);
  const dismissInstructionsRef = useRef(dismissInstructions);
  useEffect(() => {
    dismissInstructionsRef.current = dismissInstructions;
  }, [dismissInstructions]);

  useEffect(() => {
    showGestureRef.current = showGestureCue;
  }, [showGestureCue]);

  const hideGestureCue = useCallback(
    (skipFade = false) => {
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
        gestureTimeoutRef.current = null;
      }
      gestureLoopRef.current?.stop?.();
      gestureLoopRef.current = null;

      if (skipFade) {
        gestureActiveRef.current = false;
        gestureOpacity.stopAnimation();
        gesturePosition.stopAnimation();
        showGestureRef.current = false;
        setShowGestureCue(false);
        return;
      }

      if (!gestureActiveRef.current && !showGestureRef.current) {
        return;
      }

      gestureActiveRef.current = false;
      showGestureRef.current = false;
      Animated.timing(gestureOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          showGestureRef.current = false;
          setShowGestureCue(false);
        }
      });
    },
    [gestureOpacity, gesturePosition],
  );

  const startGestureCue = useCallback(() => {
    gestureLoopRef.current?.stop?.();
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
    }
    gestureOpacity.setValue(0);
    gesturePosition.setValue({ x: 0, y: 0 });
    showGestureRef.current = true;
    setShowGestureCue(true);
    gestureActiveRef.current = true;

    Animated.timing(gestureOpacity, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();

    const gesturePath = Animated.sequence([
      Animated.timing(gesturePosition, {
        toValue: { x: 34, y: -24 },
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(gesturePosition, {
        toValue: { x: -26, y: 36 },
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(gesturePosition, {
        toValue: { x: 0, y: 0 },
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(gesturePath, { iterations: 2 });
    gestureLoopRef.current = loop;
    loop.start();

    gestureTimeoutRef.current = setTimeout(() => {
      hideGestureCue();
    }, 4200);
  }, [gestureOpacity, gesturePosition, hideGestureCue]);

  useEffect(() => {
    const tokens = uniquePlayableEntries;
    instructionsOpacity.setValue(1);
    setInstructionsDismissed(false);
    if (instructionsTimerRef.current) {
      clearTimeout(instructionsTimerRef.current);
    }
    instructionsTimerRef.current = setTimeout(() => {
      if (dismissInstructionsRef.current) {
        dismissInstructionsRef.current();
      }
    }, 2400);
    matchKeyRef.current = matchKeys;
    hideGestureCue(true);
    const startX = clampCarX(SCREEN_WIDTH / 2 - CAR_SIZE / 2);
    const startY = clampCarY((PLAY_AREA_TOP + CAR_BOTTOM_BOUND) / 2);
    gestureAnchorRef.current = { x: startX, y: startY };
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
    const tryPlaceWord = (entry, idx) => {
      const displayWord = getEntryDisplayWord(entry);
      const matchKey = entry.canonical || entry.clean || entry.original || displayWord;
      const id = `${matchKey}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
      const tryCandidate = (rawCx, rawCy, radius) => {
        const cx = clampWordCenterX(rawCx, radius);
        const cy = clampWordCenterY(rawCy, radius);
        if (!isClearOfCar(cx, cy, radius)) return null;
        if (overlapsPlaced(cx, cy, radius)) return null;
        return { text: displayWord, matchKey, id, cx, cy, radius };
      };
      const attemptRandom = (radius) => {
        const minX = WORD_MARGIN + radius;
        const maxX = SCREEN_WIDTH - WORD_MARGIN - radius;
        const minY = PLAY_AREA_TOP + radius;
        const maxY = PLAY_AREA_BOTTOM_EDGE - radius;
        if (minX > maxX || minY > maxY) return null;
        const attempts = 120;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          const cx = minX + Math.random() * (maxX - minX);
          const cy = minY + Math.random() * (maxY - minY);
          const candidate = tryCandidate(cx, cy, radius);
          if (candidate) return candidate;
        }
        return null;
      };
      const attemptOffsets = (radius) => {
        const offsets = [
          { x: radius + CAR_SPAWN_BUFFER, y: 0 },
          { x: -(radius + CAR_SPAWN_BUFFER), y: 0 },
          { x: 0, y: radius + CAR_SPAWN_BUFFER },
          { x: 0, y: -(radius + CAR_SPAWN_BUFFER) },
          { x: radius + CAR_SPAWN_BUFFER, y: radius + CAR_SPAWN_BUFFER },
          { x: -(radius + CAR_SPAWN_BUFFER), y: radius + CAR_SPAWN_BUFFER },
          { x: radius + CAR_SPAWN_BUFFER, y: -(radius + CAR_SPAWN_BUFFER) },
          { x: -(radius + CAR_SPAWN_BUFFER), y: -(radius + CAR_SPAWN_BUFFER) },
        ];
        for (let i = 0; i < offsets.length; i += 1) {
          const offset = offsets[i];
          const candidate = tryCandidate(carCenterX + offset.x, carCenterY + offset.y, radius);
          if (candidate) return candidate;
        }
        return null;
      };
      const attemptGrid = (radius, stepScale = 1.25) => {
        const minX = WORD_MARGIN + radius;
        const maxX = SCREEN_WIDTH - WORD_MARGIN - radius;
        const minY = PLAY_AREA_TOP + radius;
        const maxY = PLAY_AREA_BOTTOM_EDGE - radius;
        if (minX > maxX || minY > maxY) return null;
        const step = Math.max(radius + WORD_OVERLAP_BUFFER, radius * stepScale);
        const offsets = [0, step / 2];
        for (let o = 0; o < offsets.length; o += 1) {
          const offset = offsets[o];
          for (let cy = minY + offset; cy <= maxY; cy += step) {
            for (let cx = minX + offset; cx <= maxX; cx += step) {
              const candidate = tryCandidate(cx, cy, radius);
              if (candidate) return candidate;
            }
          }
        }
        return null;
      };
      const tryRadius = (radius) =>
        attemptRandom(radius) || attemptOffsets(radius) || attemptGrid(radius);
      const tryDenseRadius = (radius) =>
        attemptGrid(radius, 1.1) || attemptGrid(radius, 1);

      let desiredRadius = computeWordRadius(displayWord);
      let placement = tryRadius(desiredRadius);
      let currentRadius = desiredRadius;
      const shrinkStep = 4;
      while (!placement && currentRadius > MIN_WORD_RADIUS) {
        currentRadius = Math.max(MIN_WORD_RADIUS, currentRadius - shrinkStep);
        placement = tryRadius(currentRadius);
      }
      if (!placement) {
        placement = tryDenseRadius(MIN_WORD_RADIUS);
      }
      if (!placement) {
        const fallbackRadii = [
          Math.max(16, MIN_WORD_RADIUS - 4),
          Math.max(14, MIN_WORD_RADIUS - 8),
        ];
        for (let i = 0; i < fallbackRadii.length && !placement; i += 1) {
          const radius = fallbackRadii[i];
          placement = tryDenseRadius(radius) || tryRadius(radius);
        }
      }
      if (!placement) {
        for (let radius = Math.max(12, MIN_WORD_RADIUS - 10); radius >= 12 && !placement; radius -= 2) {
          placement = tryDenseRadius(radius) || tryRadius(radius);
        }
      }
      if (!placement) {
        for (let radius = Math.max(10, MIN_WORD_RADIUS - 12); radius >= 8 && !placement; radius -= 2) {
          placement = tryDenseRadius(radius) || tryRadius(radius);
        }
      }
      if (!placement) {
        const minRadius = 8;
        const minX = WORD_MARGIN + minRadius;
        const maxX = SCREEN_WIDTH - WORD_MARGIN - minRadius;
        const minY = PLAY_AREA_TOP + minRadius;
        const maxY = PLAY_AREA_BOTTOM_EDGE - minRadius;
        if (minX <= maxX && minY <= maxY) {
          const step = Math.max(minRadius + WORD_OVERLAP_BUFFER, minRadius * 1.2);
          const offsets = [0, step / 2];
          for (let o = 0; o < offsets.length && !placement; o += 1) {
            const offset = offsets[o];
            for (let cy = minY + offset; cy <= maxY && !placement; cy += step) {
              for (let cx = minX + offset; cx <= maxX && !placement; cx += step) {
                placement = tryCandidate(cx, cy, minRadius);
              }
            }
          }
          if (!placement) {
            const attempts = 320;
            for (let attempt = 0; attempt < attempts && !placement; attempt += 1) {
              const cx = minX + Math.random() * (maxX - minX);
              const cy = minY + Math.random() * (maxY - minY);
              placement = tryCandidate(cx, cy, minRadius);
            }
          }
        }
      }
      if (!placement) {
        for (let radius = 6; radius >= 4 && !placement; radius -= 2) {
          placement = tryDenseRadius(radius) || tryRadius(radius);
        }
      }
      if (!placement) {
        const safeRadius = 8;
        const orbitDistance = safeRadius + CAR_SPAWN_BUFFER;
        for (let angle = 0; angle < 360 && !placement; angle += 6) {
          const radians = (angle * Math.PI) / 180;
          const cx = carCenterX + Math.cos(radians) * orbitDistance;
          const cy = carCenterY + Math.sin(radians) * orbitDistance;
          placement = tryCandidate(cx, cy, safeRadius);
        }
      }
      if (!placement) {
        const safeRadius = 8;
        placement = tryCandidate(
          SCREEN_WIDTH / 2,
          (PLAY_AREA_TOP + PLAY_AREA_BOTTOM_EDGE) / 2,
          safeRadius,
        );
      }
      if (!placement) {
        const safeRadius = 8;
        placement = tryCandidate(
          clampWordCenterX(WORD_MARGIN + safeRadius, safeRadius),
          clampWordCenterY(PLAY_AREA_TOP + safeRadius, safeRadius),
          safeRadius,
        );
      }
      return (
        placement ?? {
          text: displayWord,
          matchKey,
          id,
          cx: clampWordCenterX(SCREEN_WIDTH / 2, 8),
          cy: clampWordCenterY((PLAY_AREA_TOP + PLAY_AREA_BOTTOM_EDGE) / 2, 8),
          radius: 8,
        }
      );
    };
    const generated = tokens.map((entry, idx) => {
      const placement = tryPlaceWord(entry, idx);
      placed.push(placement);
      return placement;
    });
    setWords(generated);
    setCollectedKeys([]);
    setNextIndex(0);
    setLives(initialLives);
    setMessage('');
    setCar({ x: startX, y: startY });
    pendingLoseRef.current = false;
    initializedRef.current = true;
    if (tokens.length > 0) {
      startGestureCue();
    }
  }, [quote, uniquePlayableEntries, matchKeys, level, hideGestureCue, startGestureCue, instructionsOpacity]);

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

      const expectedKey = matchKeyRef.current[nextIndex];
      if (!expectedKey) {
        return prev;
      }
      if (collided.matchKey === expectedKey) {
        // Correct word: collect in order
        setCollectedKeys((keys) => [...keys, expectedKey]);
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
          pendingLoseRef.current = true;
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
    const totalWords = matchKeyRef.current.length;
    if (words.length === 0 && totalWords > 0 && collectedKeys.length >= totalWords) {
      onWin?.();
    }
  }, [words, onWin, collectedKeys.length]);

  useEffect(() => {
    if (pendingLoseRef.current && lives === 0) {
      pendingLoseRef.current = false;
      onLose?.();
    }
  }, [lives, onLose]);

  useEffect(
    () => () => {
      hideGestureCue(true);
      if (instructionsTimerRef.current) {
        clearTimeout(instructionsTimerRef.current);
        instructionsTimerRef.current = null;
      }
    },
    [hideGestureCue],
  );

  const onTouchAt = (x, y) => {
    // Center the car under the finger and clamp to bounds
    const targetX = Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, x - CAR_SIZE / 2));
    const targetY = Math.max(0, Math.min(SCREEN_HEIGHT - CAR_SIZE, y - CAR_SIZE / 2));
    const clampedX = clampCarX(targetX);
    const clampedY = clampCarY(targetY);
    hideGestureCue();
    dismissInstructions();
    setCar({ x: clampedX, y: clampedY });
    checkCollision(clampedX, clampedY);
  };

  const { x: gestureAnchorX, y: gestureAnchorY } = gestureAnchorRef.current;

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
            {!instructionsDismissed && (
              <Animated.View style={[styles.instructionsWrap, { opacity: instructionsOpacity }]}> 
                <Text style={styles.trayLabel}>How to Play</Text>
                <Text style={styles.trayText}>Drag the car to collect each highlighted word in order.</Text>
              </Animated.View>
            )}
            {instructionsDismissed && (
              <>
                <Text style={styles.trayLabel}>Quote Progress</Text>
                <Text style={styles.trayQuote}>{quoteProgress}</Text>
              </>
            )}
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
              minimumFontScale={0.5}
            >
              {w.text}
            </Text>
          </View>
        ))}
        {showGestureCue && (
          <View pointerEvents="none" style={styles.gestureContainer}>
            <Animated.View
              style={[
                styles.gesturePointer,
                {
                  left: gestureAnchorX + CAR_SIZE / 2 - 28,
                  top: gestureAnchorY + CAR_SIZE / 2 - 28,
                  opacity: gestureOpacity,
                  transform: [
                    { translateX: gesturePosition.x },
                    { translateY: gesturePosition.y },
                  ],
                },
              ]}
            >
              <Text style={styles.gesturePointerText}>👆</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.gestureTooltip,
                {
                  left: gestureAnchorX + CAR_SIZE / 2 - 92,
                  top: gestureAnchorY + CAR_SIZE / 2 + 54,
                  opacity: gestureOpacity,
                },
              ]}
            >
              <Text style={styles.gestureHint}>Tap & drag to steer</Text>
            </Animated.View>
          </View>
        )}
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
    alignSelf: 'stretch',
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
  instructionsWrap: {
    alignSelf: 'stretch',
    marginBottom: 2,
  },
  trayQuote: {
    fontSize: 18,
    color: themeVariables.whiteColor,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 2,
    textAlign: 'left',
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
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  wordText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  gestureContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  gesturePointer: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gesturePointerText: {
    fontSize: 28,
  },
  gestureTooltip: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    maxWidth: 200,
  },
  gestureHint: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
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
