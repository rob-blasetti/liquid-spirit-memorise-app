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
const TOP_SAFE_ZONE = 120;
const OBSTACLE_RADIUS = 28;
const OBSTACLE_MIN_TOP_OFFSET = 90;
const OBSTACLE_MOVEMENT_RANGE = 80;
const OBSTACLE_HIT_COOLDOWN_MS = 600;
const PLAY_AREA_TOP = TOP_PLAY_PADDING;
const PLAY_AREA_BOTTOM_EDGE = SCREEN_HEIGHT - BOTTOM_PLAY_PADDING;
const CAR_BOTTOM_BOUND = Math.max(PLAY_AREA_TOP, PLAY_AREA_BOTTOM_EDGE - CAR_SIZE);
const clampCarX = (value) => Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, value));
const clampCarY = (value) => Math.max(PLAY_AREA_TOP, Math.min(CAR_BOTTOM_BOUND, value));
const clampWordCenterX = (value, radius) =>
  Math.max(radius + WORD_MARGIN, Math.min(SCREEN_WIDTH - radius - WORD_MARGIN, value));
const clampWordCenterY = (value, radius) =>
  Math.max(PLAY_AREA_TOP + TOP_SAFE_ZONE + radius, Math.min(PLAY_AREA_BOTTOM_EDGE - radius, value));
const computeWordRadius = (text) =>
  Math.min(MAX_WORD_RADIUS, Math.max(MIN_WORD_RADIUS, text.length * 2.5 + 14));
const DIFFICULTY_SETTINGS = {
  1: { wordsToCollect: 5, obstacleCount: 2, obstacleSpeed: 0 },
  2: { wordsToCollect: 8, obstacleCount: 3, obstacleSpeed: 0 },
  3: { wordsToCollect: 12, obstacleCount: 3, obstacleSpeed: 70 },
};

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
  const { level } = useDifficulty() || { level: 1 };
  const difficultySettings = useMemo(
    () => DIFFICULTY_SETTINGS[level] || DIFFICULTY_SETTINGS[3],
    [level],
  );
  const wordsTarget = difficultySettings.wordsToCollect ?? uniquePlayableEntries.length;
  const selectedEntries = useMemo(() => {
    if (!wordsTarget || uniquePlayableEntries.length <= wordsTarget) {
      return uniquePlayableEntries;
    }
    return uniquePlayableEntries.slice(0, wordsTarget);
  }, [uniquePlayableEntries, wordsTarget]);
  const matchKeys = useMemo(
    () =>
      selectedEntries.map(
        (entry) => entry.canonical || entry.clean || entry.original || getEntryDisplayWord(entry),
      ),
    [selectedEntries],
  );
  const targetWordCount = matchKeys.length;
  const playableIndexSet = useMemo(
    () => new Set(selectedEntries.map((entry) => entry.index)),
    [selectedEntries],
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
  const initialLives = level === 1 ? 6 : level === 2 ? 4 : 2;
  const carRef = useRef(null);
  const obstaclesRef = useRef([]);
  const obstacleAnimationRef = useRef(null);
  const lastObstacleHitRef = useRef(0);
  const [car, setCar] = useState(() => {
    const initialX = clampCarX(SCREEN_WIDTH / 2 - CAR_SIZE / 2);
    const initialY = clampCarY((PLAY_AREA_TOP + CAR_BOTTOM_BOUND) / 2);
    const initial = { x: initialX, y: initialY };
    carRef.current = initial;
    return initial;
  });
  const [words, setWords] = useState([]);
  const [obstacles, setObstacles] = useState([]);
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
  const stopObstacleAnimation = useCallback(() => {
    if (obstacleAnimationRef.current != null) {
      cancelAnimationFrame(obstacleAnimationRef.current);
      obstacleAnimationRef.current = null;
    }
  }, []);
  const hasObstacleCollision = useCallback((carCenterX, carCenterY) => {
    const carRadius = CAR_SIZE / 2;
    return obstaclesRef.current.some((obs) => {
      const dx = obs.cx - carCenterX;
      const dy = obs.cy - carCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < obs.radius + carRadius;
    });
  }, []);
  const handleObstacleHit = useCallback(() => {
    const now = Date.now();
    if (now - lastObstacleHitRef.current < OBSTACLE_HIT_COOLDOWN_MS) {
      return;
    }
    lastObstacleHitRef.current = now;
    setLives((lv) => {
      const next = Math.max(0, lv - 1);
      if (next === 0) {
        setMessage('');
        pendingLoseRef.current = true;
      } else {
        setMessage('Watch out! Obstacle hit');
      }
      return next;
    });
  }, []);
  const resolveObstacleCollision = useCallback(
    (carCenterX, carCenterY) => {
      if (!hasObstacleCollision(carCenterX, carCenterY)) {
        return false;
      }
      handleObstacleHit();
      return true;
    },
    [handleObstacleHit, hasObstacleCollision],
  );

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
    const tokens = selectedEntries;
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
    stopObstacleAnimation();
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
        const minY = PLAY_AREA_TOP + TOP_SAFE_ZONE + radius;
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
        const minY = PLAY_AREA_TOP + TOP_SAFE_ZONE + radius;
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
        const minY = PLAY_AREA_TOP + TOP_SAFE_ZONE + minRadius;
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
          clampWordCenterY(PLAY_AREA_TOP + TOP_SAFE_ZONE + safeRadius, safeRadius),
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
    const obstacleCount = difficultySettings.obstacleCount ?? 0;
    const obstacleSpeed = difficultySettings.obstacleSpeed ?? 0;
    const movementRange = level === 3 ? OBSTACLE_MOVEMENT_RANGE : 0;
    const tryPlaceObstacle = (idx) => {
      const radius = OBSTACLE_RADIUS;
      const horizontalAllowance = movementRange;
      const bufferRadius = radius + (horizontalAllowance > 0 ? horizontalAllowance : 0);
      const minX = WORD_MARGIN + radius + horizontalAllowance;
      const maxX = SCREEN_WIDTH - WORD_MARGIN - radius - horizontalAllowance;
      const minY = Math.max(
        PLAY_AREA_TOP + TOP_SAFE_ZONE + radius,
        PLAY_AREA_TOP + radius + OBSTACLE_MIN_TOP_OFFSET,
      );
      const maxY = PLAY_AREA_BOTTOM_EDGE - radius - 24;
      if (minX > maxX || minY > maxY) {
        return null;
      }
      const attempts = 200;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const rawCx = minX + Math.random() * (maxX - minX);
        const rawCy = minY + Math.random() * (maxY - minY);
        const cx = clampWordCenterX(rawCx, radius);
        const cy = clampWordCenterY(rawCy, radius);
        if (!isClearOfCar(cx, cy, radius)) continue;
        if (overlapsPlaced(cx, cy, bufferRadius)) continue;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const minLaneX = Math.max(WORD_MARGIN + radius, cx - horizontalAllowance);
        const maxLaneX = Math.min(SCREEN_WIDTH - WORD_MARGIN - radius, cx + horizontalAllowance);
        placed.push({ cx, cy, radius: bufferRadius });
        return {
          id: `obstacle-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          cx,
          cy,
          radius,
          speed: obstacleSpeed,
          direction,
          minX: minLaneX,
          maxX: maxLaneX,
        };
      }
      return null;
    };
    const generated = tokens.map((entry, idx) => {
      const placement = tryPlaceWord(entry, idx);
      placed.push(placement);
      return placement;
    });
    const createdObstacles = [];
    for (let i = 0; i < obstacleCount; i += 1) {
      const obstacle = tryPlaceObstacle(i);
      if (obstacle) {
        createdObstacles.push(obstacle);
      }
    }
    obstaclesRef.current = createdObstacles;
    setObstacles(createdObstacles);
    setWords(generated);
    setCollectedKeys([]);
    setNextIndex(0);
    setLives(initialLives);
    setMessage('');
    const startPosition = { x: startX, y: startY };
    carRef.current = startPosition;
    setCar(startPosition);
    lastObstacleHitRef.current = 0;
    pendingLoseRef.current = false;
    initializedRef.current = true;
    if (tokens.length > 0) {
      startGestureCue();
    } else {
      setShowGestureCue(false);
    }
  }, [
    quote,
    selectedEntries,
    matchKeys,
    level,
    hideGestureCue,
    startGestureCue,
    instructionsOpacity,
    difficultySettings,
    initialLives,
    stopObstacleAnimation,
  ]);

  const checkCollision = (x, y) => {
    const carCenterX = x + CAR_SIZE / 2;
    const carCenterY = y + CAR_SIZE / 2;
    if (resolveObstacleCollision(carCenterX, carCenterY)) {
      return;
    }
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
    if (level !== 3 || obstacles.length === 0 || (difficultySettings.obstacleSpeed ?? 0) <= 0) {
      stopObstacleAnimation();
      return undefined;
    }
    let lastTimestamp = Date.now();
    const step = () => {
      const now = Date.now();
      const delta = Math.min((now - lastTimestamp) / 1000, 0.5);
      lastTimestamp = now;
      let changed = false;
      const updated = obstaclesRef.current.map((obs) => {
        if (!obs.speed) {
          return obs;
        }
        const next = { ...obs };
        let nextCx = next.cx + next.speed * delta * next.direction;
        if (nextCx < next.minX) {
          nextCx = next.minX;
          next.direction = 1;
        } else if (nextCx > next.maxX) {
          nextCx = next.maxX;
          next.direction = -1;
        }
        if (Math.abs(nextCx - next.cx) > 0.1) {
          changed = true;
        }
        next.cx = nextCx;
        return next;
      });
      if (changed) {
        obstaclesRef.current = updated;
        setObstacles(updated);
        const carPosition = carRef.current;
        if (carPosition) {
          const carCenterX = carPosition.x + CAR_SIZE / 2;
          const carCenterY = carPosition.y + CAR_SIZE / 2;
          resolveObstacleCollision(carCenterX, carCenterY);
        }
      }
      obstacleAnimationRef.current = requestAnimationFrame(step);
    };
    obstacleAnimationRef.current = requestAnimationFrame(step);
    return () => {
      stopObstacleAnimation();
    };
  }, [
    level,
    obstacles,
    difficultySettings.obstacleSpeed,
    resolveObstacleCollision,
    stopObstacleAnimation,
  ]);

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
      stopObstacleAnimation();
    },
    [hideGestureCue, stopObstacleAnimation],
  );

  const onTouchAt = (x, y) => {
    // Center the car under the finger and clamp to bounds
    const targetX = Math.max(0, Math.min(SCREEN_WIDTH - CAR_SIZE, x - CAR_SIZE / 2));
    const targetY = Math.max(0, Math.min(SCREEN_HEIGHT - CAR_SIZE, y - CAR_SIZE / 2));
    const clampedX = clampCarX(targetX);
    const clampedY = clampCarY(targetY);
    hideGestureCue();
    dismissInstructions();
    const nextPosition = { x: clampedX, y: clampedY };
    carRef.current = nextPosition;
    setCar(nextPosition);
    checkCollision(clampedX, clampedY);
  };

  const { x: gestureAnchorX, y: gestureAnchorY } = gestureAnchorRef.current;

  return (
    <View style={styles.container}>
      <GameTopBar
        onBack={onBack}
        variant="whiteShadow"
        preserveLeftPlaceholder
        preserveRightPlaceholder={false}
        title={
          <View style={styles.titleRow}>
            <Text style={styles.titleFlag}>🏁</Text>
            <Text style={styles.navTitle}>Word Racer</Text>
          </View>
        }
        rightAccessory={
          <View style={styles.navLivesBadge}>
            <Text style={styles.navLivesText}>Lives {lives}</Text>
          </View>
        }
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
                <Text style={styles.trayText}>
                  {`Drag the car to collect ${targetWordCount} word${
                    targetWordCount === 1 ? '' : 's'
                  } in order and dodge obstacles.`}
                </Text>
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
        {obstacles.map((obstacle) => (
          <View
            key={obstacle.id}
            style={[
              styles.obstacle,
              {
                left: obstacle.cx - obstacle.radius,
                top: obstacle.cy - obstacle.radius,
                width: obstacle.radius * 2,
                height: obstacle.radius * 2,
                borderRadius: obstacle.radius,
              },
            ]}
          >
            <Text style={styles.obstacleText}>⛔️</Text>
          </View>
        ))}
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
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  titleFlag: {
    fontSize: 26,
    marginTop: 2,
    marginRight: 8,
  },
  navLivesBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: themeVariables.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navLivesText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  topOverlay: {
    position: 'absolute',
    top: PLAY_AREA_TOP - 60,
    left: 24,
    right: 24,
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
  obstacle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  obstacleText: {
    fontSize: 22,
  },
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
