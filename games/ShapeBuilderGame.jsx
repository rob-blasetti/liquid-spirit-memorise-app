import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import GameTopBar from '../components/GameTopBar';
import PuzzlePiece from '../components/PuzzlePieceSvg';
import PuzzleSlotSvg from '../components/PuzzleSlotSvg';
import { buildJigsawPath } from '../components/PuzzlePath';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';
import { prepareQuoteForGame } from '../services/quoteSanitizer';
import { FAB_BOTTOM_MARGIN } from '../components/DifficultyFAB';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

// Dimensions and sizes
const { width, height } = Dimensions.get('window');
const MARGIN = 0;

const ShapeBuilderGame = ({ quote, rawQuote, sanitizedQuote, onBack, onWin, onLose }) => {
  // Difficulty settings: number of pieces and pre-completed count from global context
  const safeInsets = useContext(SafeAreaInsetsContext);
  const fabBottomSpacing = Math.max(safeInsets?.bottom || 0, 0) + FAB_BOTTOM_MARGIN;
  const { level: difficulty } = useDifficulty();
  const pieceCounts = { 1: 8, 2: 16, 3: 24 };
  const prePlacedCounts = { 1: 2, 2: 4, 3: 6 };
  const pieceCount = pieceCounts[difficulty] || 8;
  const prePlaced = prePlacedCounts[difficulty] || 2;
  // Timer based on difficulty
  const initialTime = 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);
  const isDangerTime = timeLeft <= 10;
  const quoteData = useMemo(
    () => prepareQuoteForGame(quote, { raw: rawQuote, sanitized: sanitizedQuote }),
    [quote, rawQuote, sanitizedQuote],
  );
  // Prepare words and split into interactive and pre-placed sets, skipping punctuation-only tokens
  const playableEntries = useMemo(
    () => quoteData.entries.filter((entry) => entry.playable),
    [quoteData.entries],
  );
  const allWords = useMemo(
    () => playableEntries.map((entry) => entry.original).filter((word) => word && word.length > 0),
    [playableEntries],
  );
  const WORD_COUNT = allWords.length;
  const interactiveCount = Math.min(pieceCount, WORD_COUNT);
  // Use a square grid (rows == cols). If not enough words, pad with blanks
  const gridDim = Math.ceil(Math.sqrt(Math.max(WORD_COUNT, interactiveCount)));
  const count = gridDim * gridDim; // total tiles, including blank fillers
  // Ensure we never auto-complete on mount: always leave at least 1 interactive piece unplaced
  const prePlacedEffective = Math.min(prePlaced, Math.max(0, interactiveCount - 1));
  // Debug: initialization details
  // eslint-disable-next-line no-console
  console.log('[ShapeBuilder:init]', { level: difficulty, pieceCount, interactiveCount, prePlaced, prePlacedEffective, totalWords: WORD_COUNT, gridDim, gridCount: count });

  // Compute outline slot positions in a centered square grid
  const cols = gridDim;
  const rows = gridDim;
  // Dynamically size pieces to keep words on one line and fit the screen
  // Slightly reduce from max fit to avoid crowding; allow a bit smaller minimum
  const MAX_AREA_H = Math.floor(height * 0.62);
  const sizeByW = Math.floor((width - (cols - 1) * MARGIN - 40) / cols);
  const sizeByH = Math.floor((MAX_AREA_H - (rows - 1) * MARGIN) / rows);
  const PIECE_SIZE = Math.max(48, Math.floor(Math.min(sizeByW, sizeByH) * 0.84));
  const SLOT_SIZE = PIECE_SIZE;

  const totalW = cols * SLOT_SIZE + (cols - 1) * MARGIN;
  const totalH = rows * SLOT_SIZE + (rows - 1) * MARGIN;
  const startX = (width - totalW) / 2;
  const startY = (height - totalH) / 2;
  const slots = useMemo(() => {
    return Array.from({ length: count }, (_, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      return {
        x: startX + c * (SLOT_SIZE + MARGIN),
        y: startY + r * (SLOT_SIZE + MARGIN),
      };
    });
  }, [count, cols, startX, startY, SLOT_SIZE]);

  // Build connector types for each piece side (convex, concave, or flat) to interlock
  const connectors = useMemo(() => {
    const opposite = (t) => t === 'convex' ? 'concave' : t === 'concave' ? 'convex' : 'flat';
    const conns = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const top = r === 0 ? 'flat' : opposite(conns[(r - 1) * cols + c].bottom);
        const left = c === 0 ? 'flat' : opposite(conns[r * cols + (c - 1)].right);
        const right = c === cols - 1 ? 'flat' : (Math.random() < 0.5 ? 'convex' : 'concave');
        const bottom = r === rows - 1 ? 'flat' : (Math.random() < 0.5 ? 'convex' : 'concave');
        conns[i] = { top, right, bottom, left };
      }
    }
    return conns;
  }, [rows, cols]);

  // Start/reset countdown timer on mount and whenever difficulty/quote changes
  useEffect(() => {
    // clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(initialTime);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // time up: trigger loss overlay unless already won
          if (!winTriggeredRef.current) {
            if (typeof onLose === 'function') setTimeout(() => onLose(), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [initialTime, quoteData.raw]);
  // Compute initial positions of pieces scattered around puzzle perimeter (memoized)
  const initialPositions = useMemo(() => {
    const positions = [];
    const placed = [];
    const baseSeparation = Math.max(PIECE_SIZE * 1.12, 52); // encourage clear spacing between pieces
    const SAFE_TOP = 140; // keep clear of title/description area
    // Avoid bottom nav and leave headroom for FAB and its expanded chips
    const FAB_W = 56, FAB_H = 56, FAB_RIGHT = 24;
    const FAB_BOTTOM = fabBottomSpacing;
    const SAFE_BOTTOM = Math.max(148, FAB_BOTTOM + FAB_H + 28); // ~138 -> round up for safety
    const SAFE_SIDE = 10;

    const puzzleWidth = cols * SLOT_SIZE + (cols - 1) * MARGIN;
    const puzzleHeight = rows * SLOT_SIZE + (rows - 1) * MARGIN;
    const puzzleMinX = startX;
    const puzzleMinY = startY;
    const puzzleMaxX = puzzleMinX + puzzleWidth;
    const puzzleMaxY = puzzleMinY + puzzleHeight;

    // Define spawn strips: left, right, bottom, and (optionally) top (avoid top header overlap)
    let strips = [];
    // Left strip
    if (puzzleMinX - SAFE_SIDE - PIECE_SIZE > SAFE_SIDE) {
      strips.push({
        x0: SAFE_SIDE,
        y0: SAFE_TOP,
        x1: Math.max(SAFE_SIDE, puzzleMinX - MARGIN),
        y1: Math.min(height - SAFE_BOTTOM, puzzleMaxY),
      });
    }
    // Top strip (only if there is room between header and puzzle)
    if (SAFE_TOP + PIECE_SIZE < puzzleMinY - MARGIN) {
      strips.push({
        x0: SAFE_SIDE,
        y0: SAFE_TOP,
        x1: width - SAFE_SIDE,
        y1: Math.max(SAFE_TOP + PIECE_SIZE, puzzleMinY - MARGIN),
      });
    }
    // Right strip
    if (width - puzzleMaxX - SAFE_SIDE - PIECE_SIZE > SAFE_SIDE) {
      strips.push({
        x0: Math.min(width - SAFE_SIDE, puzzleMaxX + MARGIN),
        y0: SAFE_TOP,
        x1: width - SAFE_SIDE,
        y1: Math.min(height - SAFE_BOTTOM, puzzleMaxY),
      });
    }
    // Bottom strip (avoid bottom nav)
    if (height - SAFE_BOTTOM - (puzzleMaxY + MARGIN + PIECE_SIZE) > 0) {
      strips.push({
        x0: SAFE_SIDE,
        y0: Math.min(height - SAFE_BOTTOM, puzzleMaxY + MARGIN),
        x1: width - SAFE_SIDE,
        y1: height - SAFE_BOTTOM,
      });
    }

    // FAB exclusion: avoid placing pieces under the Difficulty FAB area
    // FAB sizing from DifficultyFAB: width=56, bottom=54, right=24
    const FAB_PAD = Math.max(16, Math.floor(PIECE_SIZE * 0.6));
    const fabRect = {
      x0: Math.max(0, width - FAB_RIGHT - FAB_W - FAB_PAD),
      y0: Math.max(0, height - FAB_BOTTOM - FAB_H - FAB_PAD),
      x1: Math.min(width, width - FAB_RIGHT + FAB_PAD),
      y1: Math.min(height, height - FAB_BOTTOM + FAB_PAD),
    };

    // Timer exclusion: bottom-left timer piece area
    const TIMER_LEFT = 16;
    const TIMER_BOTTOM = fabBottomSpacing;
    const TIMER_W = Math.max(84, Math.floor(PIECE_SIZE * 1.4));
    const TIMER_H = Math.max(48, Math.floor(PIECE_SIZE * 1.0));
    const TIMER_PAD = Math.max(12, Math.floor(PIECE_SIZE * 0.2));
    const timerRect = {
      x0: Math.max(0, TIMER_LEFT - TIMER_PAD),
      y0: Math.max(0, height - TIMER_BOTTOM - TIMER_H - TIMER_PAD),
      x1: Math.min(width, TIMER_LEFT + TIMER_W + TIMER_PAD),
      y1: Math.min(height, height - TIMER_BOTTOM + TIMER_PAD),
    };

    // Helper: subtract FAB rect from a strip (axis-aligned)
    const subtractRect = (r, rect) => {
      const out = [];
      const ox0 = Math.max(r.x0, rect.x0);
      const oy0 = Math.max(r.y0, rect.y0);
      const ox1 = Math.min(r.x1, rect.x1);
      const oy1 = Math.min(r.y1, rect.y1);
      const overlaps = ox0 < ox1 && oy0 < oy1;
      if (!overlaps) return [r];
      const w = r.x1 - r.x0;
      const h = r.y1 - r.y0;
      // If horizontal strip (w >= h): split left/right
      if (w >= h) {
        if (r.x0 < rect.x0) out.push({ x0: r.x0, y0: r.y0, x1: Math.max(r.x0, rect.x0), y1: r.y1 });
        if (rect.x1 < r.x1) out.push({ x0: Math.min(r.x1, rect.x1), y0: r.y0, x1: r.x1, y1: r.y1 });
      } else {
        // Vertical strip: split above/below
        if (r.y0 < rect.y0) out.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: Math.max(r.y0, rect.y0) });
        if (rect.y1 < r.y1) out.push({ x0: r.x0, y0: Math.min(r.y1, rect.y1), x1: r.x1, y1: r.y1 });
      }
      return out;
    };
    // Apply exclusion to all strips and require extra padding for placement
    strips = strips
      .flatMap((s) => subtractRect(s, fabRect))
      .flatMap((s) => subtractRect(s, timerRect))
      .filter(s => (s.x1 - s.x0) > (PIECE_SIZE + 12) && (s.y1 - s.y0) > (PIECE_SIZE + 12));

    // Fallback: if no strips available (rare), allow top area (still avoid FAB)
    if (strips.length === 0) {
      const topStrip = { x0: SAFE_SIDE, y0: SAFE_TOP, x1: width - SAFE_SIDE, y1: Math.min(height - SAFE_BOTTOM, puzzleMinY - MARGIN) };
      strips = subtractRect(topStrip, fabRect).flatMap((s) => subtractRect(s, timerRect));
    }

    const area = (r) => Math.max(0, (r.x1 - r.x0 - PIECE_SIZE)) * Math.max(0, (r.y1 - r.y0 - PIECE_SIZE));
    const weights = strips.map(area);
    const totalArea = weights.reduce((a, b) => a + b, 0) || 1;
    const pickStrip = () => {
      let r = Math.random() * totalArea;
      for (let i = 0; i < strips.length; i++) {
        r -= weights[i];
        if (r <= 0) return strips[i];
      }
      return strips[strips.length - 1];
    };
    const overlaps = (a, b, dist) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy) < dist;
    };

    for (let idx = 0; idx < interactiveCount; idx++) {
      let pos = { x: SAFE_SIDE, y: SAFE_TOP };
      let attempts = 0;
      let sep = baseSeparation;
      while (attempts < 300) {
        const strip = strips.length
          ? strips[Math.floor(Math.random() * strips.length)]
          : pickStrip();
        const xMin = strip.x0;
        const xMax = strip.x1 - PIECE_SIZE;
        const yMin = strip.y0;
        const yMax = strip.y1 - PIECE_SIZE;
        if (xMax <= xMin || yMax <= yMin) { attempts++; continue; }
        const x = xMin + Math.random() * (xMax - xMin);
        const y = yMin + Math.random() * (yMax - yMin);
        pos = { x, y };
        if (!placed.some(p => overlaps(p, pos, sep))) break;
        attempts++;
        if (attempts % 80 === 0 && sep > PIECE_SIZE * 0.86) {
          sep = Math.floor(sep * 0.92); // relax separation gradually but keep comfortable spacing
        }
      }
      placed.push(pos);
      positions.push(pos);
    }
    return positions;
  }, [interactiveCount, rows, cols, startX, startY, SLOT_SIZE, PIECE_SIZE, safeInsets]);
  
  // Randomize which pieces are pre-placed
  const prePlacedIndices = useMemo(() => {
    const indices = Array.from({ length: interactiveCount }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const chosen = indices.slice(0, prePlacedEffective);
    const staticIndices = Array.from({ length: count - interactiveCount }, (_, i) => i + interactiveCount);
    return [...chosen, ...staticIndices];
  }, [count, interactiveCount, prePlacedEffective]);

  // Refs for each piece: pan position, placed flag, and PanResponder
  // Refs for each piece: pan position, placed flag, and PanResponder
  // Track placed pieces and count; initialize with pre-placed indices
  const [placedSet, setPlacedSet] = useState(() => new Set(prePlacedIndices));
  const [placedCount, setPlacedCount] = useState(prePlacedIndices.length);
  // Gate win detection until player interacts
  const hasInteractedRef = useRef(false);
  // Track active drag index for z-ordering
  const [activeIndex, setActiveIndex] = useState(null);
  // Notify parent when all interactive pieces are placed (ignore static words)
  // Skip the initial mount and until the user interacts to avoid immediate win
  const didMountRef = useRef(false);
  const winTriggeredRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!hasInteractedRef.current) {
      // eslint-disable-next-line no-console
      console.log('[ShapeBuilder:win-check] skipped — no interaction yet');
      return;
    }
    const placedInteractive = Array.from(placedSet).filter((i) => i < interactiveCount).length;
    // eslint-disable-next-line no-console
    console.log('[ShapeBuilder:win-check]', { placedInteractive, interactiveCount, level: difficulty });
    if (
      placedInteractive === interactiveCount &&
      interactiveCount > 0 &&
      onWin &&
      !winTriggeredRef.current
    ) {
      // eslint-disable-next-line no-console
      console.log('[ShapeBuilder:WIN] firing onWin');
      winTriggeredRef.current = true;
      // stop timer on win
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onWin();
    }
  }, [placedSet, interactiveCount, onWin]);
  // Reset placedCount when difficulty changes
  useEffect(() => {
    setPlacedSet(new Set(prePlacedIndices));
    setPlacedCount(prePlacedIndices.length);
    hasInteractedRef.current = false;
    winTriggeredRef.current = false;
    // eslint-disable-next-line no-console
    console.log('[ShapeBuilder:reset]', { level: difficulty, prePlacedInteractive: prePlacedIndices.slice(0, interactiveCount) });
  }, [prePlacedIndices, interactiveCount, difficulty]);
  // Keep pan values stable across renders to avoid jumping
  const pansRef = useRef([]);
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isPrePlaced = prePlacedIndices.includes(i);
      const startPos = isPrePlaced ? slots[i] : initialPositions[i] || slots[i];
      arr[i] = new Animated.ValueXY({ x: startPos.x, y: startPos.y });
    }
    pansRef.current = arr;
  }, [count, prePlacedIndices, initialPositions, slots]);

  // Generate piece data (pan, placement flag, panResponder) per difficulty
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const isPrePlaced = prePlacedIndices.includes(i);
      const isPlacedNow = isPrePlaced || placedSet.has(i);
      const pan = pansRef.current[i] || new Animated.ValueXY({ x: slots[i].x, y: slots[i].y });
      const piece = { pan, placed: isPlacedNow, panResponder: null };
      if (!isPrePlaced) {
        piece.panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => !piece.placed,
          onMoveShouldSetPanResponder: () => !piece.placed,
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
            hasInteractedRef.current = true;
            setActiveIndex(i);
            pan.setOffset({ x: pan.x._value, y: pan.y._value });
            pan.setValue({ x: 0, y: 0 });
          },
          onPanResponderMove: Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          ),
          onPanResponderRelease: () => {
            pan.flattenOffset();
            const { x: px, y: py } = pan.__getValue();
            const cx = px + PIECE_SIZE / 2;
            const cy = py + PIECE_SIZE / 2;
            const slot = slots[i];
            if (
              cx >= slot.x && cx <= slot.x + SLOT_SIZE &&
              cy >= slot.y && cy <= slot.y + SLOT_SIZE
            ) {
              Animated.spring(pan, { toValue: { x: slot.x, y: slot.y }, useNativeDriver: false }).start();
              piece.placed = true;
              setPlacedSet(prev => {
                const next = new Set(prev);
                next.add(i);
                // eslint-disable-next-line no-console
                console.log('[ShapeBuilder:placed]', { index: i, placedInteractive: Array.from(next).filter(idx => idx < interactiveCount).length, interactiveCount });
                return next;
              });
              setPlacedCount(c => c + 1);
            }
            setActiveIndex(null);
          },
        });
      }
      return piece;
    });
  }, [count, prePlacedIndices, placedSet, slots, PIECE_SIZE, SLOT_SIZE, interactiveCount]);


  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <View style={styles.titleRow}>
        <View style={styles.titleIcons}>
          {/* Back puzzle piece icon */}
          <Svg
            width={40}
            height={28}
            style={[styles.iconPiece, styles.iconBack]}
            viewBox={`0 0 28 28`}
          >
            <Path
              d={buildJigsawPath(28, { top: 'convex', right: 'flat', bottom: 'concave', left: 'flat' })}
              fill={themeVariables.primaryColor}
              stroke={'rgba(255,255,255,0.7)'}
              strokeWidth={1}
            />
          </Svg>
          {/* Front puzzle piece icon */}
          <Svg
            width={40}
            height={28}
            style={[styles.iconPiece, styles.iconFront]}
            viewBox={`0 0 28 28`}
          >
            <Path
              d={buildJigsawPath(28, { top: 'flat', right: 'convex', bottom: 'flat', left: 'concave' })}
              fill={themeVariables.whiteColor}
              stroke={themeVariables.borderColor}
              strokeWidth={1}
            />
          </Svg>
        </View>
        <Text style={styles.title}>Solve The Puzzle</Text>
      </View>
      <View style={styles.titleUnderline} />
      {/* Outline slots rendered as true jigsaw silhouettes */}
      {slots.map((pos, i) => (
        <PuzzleSlotSvg
          key={`slot-${i}`}
          left={pos.x}
          top={pos.y}
          size={SLOT_SIZE}
          connectors={connectors[i]}
        />
      ))}
      {/* Puzzle pieces including pre-placed ones and blank fillers */}
      {Array.from({ length: count }, (_, i) => {
        const { pan, panResponder, placed } = pieces[i];
        const word = i < WORD_COUNT ? allWords[i] : '';
        return (
          <PuzzlePiece
            key={i}
            word={word}
            connectors={connectors[i]}
            pan={pan}
            panResponder={panResponder}
            placed={placed}
            size={PIECE_SIZE}
            isActive={activeIndex === i}
          />
        );
      })}
      {/* Win overlay handled at parent */}
      {/* Countdown timer bottom-left shaped like a puzzle piece */}
      <View
        style={[
          styles.timerWrapper,
          {
            bottom: fabBottomSpacing,
            borderColor: isDangerTime ? 'rgba(229,47,47,0.55)' : 'rgba(114,228,87,0.45)',
            backgroundColor: isDangerTime ? 'rgba(229,47,47,0.18)' : 'rgba(88,219,51,0.18)',
          },
        ]}
        pointerEvents="none"
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={22}
          reducedTransparencyFallbackColor={
            isDangerTime ? 'rgba(229,47,47,0.24)' : 'rgba(114,228,87,0.24)'
          }
        />
        <LinearGradient
          colors={
            isDangerTime
              ? ['rgba(229,47,47,0.55)', 'rgba(165,24,24,0.26)']
              : ['rgba(114,228,87,0.45)', 'rgba(68,182,40,0.22)']
          }
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.timerContent}>
          <Text
            style={[
              styles.timerText,
              { color: isDangerTime ? themeVariables.whiteColor : themeVariables.blackColor },
            ]}
          >
            {timeLeft}s
          </Text>
        </View>
        <View
          style={[
            styles.timerShine,
            { backgroundColor: isDangerTime ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.28)' },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    fontFamily: 'Noto Sans',
    fontWeight: '900',
    color: themeVariables.whiteColor,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    // Leave room for the back button (40px) + margin (12) + outer left margin (20)
    paddingLeft: 10,
    marginTop: 16,
  },
  titleUnderline: {
    alignSelf: 'center',
    width: 180,
    borderBottomWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    borderStyle: 'dashed',
    marginTop: 2,
    marginBottom: 6,
  },
  titleIcons: {
    width: 54,
    height: 40,
    marginRight: 6,
    position: 'relative',
  },
  iconPiece: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBack: {
    left: 6,
    top: 8,
    transform: [{ rotate: '-14deg' }],
  },
  iconFront: {
    left: 16,
    top: 2,
    transform: [{ rotate: '10deg' }],
  },
  slot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: themeVariables.primaryColor,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    position: 'absolute',
    // Unplaced pieces have white background with primary-color outline
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 14,
    padding: 4,
    // Unplaced pieces use primary-color text
    color: themeVariables.primaryColor,
    textAlign: 'center',
  },
  bump: {
    position: 'absolute',
    backgroundColor: themeVariables.primaryColorLight,
    borderColor: themeVariables.primaryColor,
    borderWidth: 1,
    borderRadius: 999,
  },
  placedWord: {
    color: themeVariables.whiteColor,
  },
  cut: {
    position: 'absolute',
    backgroundColor: themeVariables.neutralLight,
    borderRadius: 999,
  },
  message: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    color: themeVariables.primaryColor,
  },
  // Buttons container at bottom for difficulty selection
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  buttonMargin: {
    marginHorizontal: 8,
  },
  timerWrapper: {
    position: 'absolute',
    left: 24,         // mirror of FAB_RIGHT
    width: 56,        // same as FAB diameter
    height: 56,
    zIndex: 3,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(114,228,87,0.45)',
    backgroundColor: 'rgba(88,219,51,0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  timerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: themeVariables.blackColor,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  timerShine: {
    borderRadius: 28,
    position: 'absolute',
    top: 6,
    left: 10,
    right: 10,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    opacity: 0.6,
  },
});

export default ShapeBuilderGame;
