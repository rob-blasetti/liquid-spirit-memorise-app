import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import PuzzlePiece from '../components/PuzzlePieceSvg';
import PuzzleSlotSvg from '../components/PuzzleSlotSvg';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';

// Dimensions and sizes
const { width, height } = Dimensions.get('window');
const MARGIN = 0;

const ShapeBuilderGame = ({ quote, onBack, onWin }) => {
  // Difficulty settings: number of pieces and pre-completed count from global context
  const { level: difficulty } = useDifficulty();
  const pieceCounts = { 1: 8, 2: 16, 3: 24 };
  const prePlacedCounts = { 1: 2, 2: 4, 3: 6 };
  const pieceCount = pieceCounts[difficulty] || 8;
  const prePlaced = prePlacedCounts[difficulty] || 2;
  // Prepare words and split into interactive and pre-placed sets
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const allWords = text.split(/\s+/).filter(w => w.length > 0);
  const interactiveCount = Math.min(pieceCount, allWords.length);
  const puzzleWords = allWords.slice(0, interactiveCount);
  const count = allWords.length;

  // Compute outline slot positions in 4x4 grid centered
  const cols = 4;
  // Compute number of rows based on piece count (4 columns)
  const rows = Math.ceil(count / cols);
  // Dynamically size pieces to keep words on one line and fit the screen
  // Slightly reduce from max fit to avoid crowding; allow a bit smaller minimum
  const MAX_AREA_H = Math.floor(height * 0.62);
  const sizeByW = Math.floor((width - (cols - 1) * MARGIN - 40) / cols);
  const sizeByH = Math.floor((MAX_AREA_H - (rows - 1) * MARGIN) / rows);
  const PIECE_SIZE = Math.max(54, Math.floor(Math.min(sizeByW, sizeByH) * 0.92));
  const SLOT_SIZE = PIECE_SIZE;

  const totalW = cols * SLOT_SIZE + (cols - 1) * MARGIN;
  const totalH = rows * SLOT_SIZE + (rows - 1) * MARGIN;
  const startX = (width - totalW) / 2;
  const startY = (height - totalH) / 2;
  const slots = allWords.map((_, idx) => {
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    return {
      x: startX + c * (SLOT_SIZE + MARGIN),
      y: startY + r * (SLOT_SIZE + MARGIN),
    };
  });

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
  // Compute initial positions of pieces scattered around puzzle perimeter (memoized)
  const initialPositions = useMemo(() => {
    const positions = [];
    const placed = [];
    const minDist = PIECE_SIZE; // minimum separation between piece origins
    const SAFE_TOP = 140; // keep clear of title/description area
    const SAFE_BOTTOM = 140; // avoid bottom nav; adjust if needed
    const SAFE_SIDE = 10;

    const puzzleWidth = cols * SLOT_SIZE + (cols - 1) * MARGIN;
    const puzzleHeight = rows * SLOT_SIZE + (rows - 1) * MARGIN;
    const puzzleMinX = startX;
    const puzzleMinY = startY;
    const puzzleMaxX = puzzleMinX + puzzleWidth;
    const puzzleMaxY = puzzleMinY + puzzleHeight;

    // Define spawn strips: left, right, bottom (avoid top near heading)
    const strips = [];
    // Left strip
    if (puzzleMinX - SAFE_SIDE - PIECE_SIZE > SAFE_SIDE) {
      strips.push({
        x0: SAFE_SIDE,
        y0: SAFE_TOP,
        x1: Math.max(SAFE_SIDE, puzzleMinX - MARGIN),
        y1: Math.min(height - SAFE_BOTTOM, puzzleMaxY),
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

    // Fallback: if no strips available (rare), allow top area
    if (strips.length === 0) {
      strips.push({ x0: SAFE_SIDE, y0: SAFE_TOP, x1: width - SAFE_SIDE, y1: Math.min(height - SAFE_BOTTOM, puzzleMinY - MARGIN) });
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
    const overlaps = (a, b, dist) => Math.abs(a.x - b.x) < dist && Math.abs(a.y - b.y) < dist;

    puzzleWords.forEach(() => {
      let pos = { x: SAFE_SIDE, y: SAFE_TOP };
      let attempts = 0;
      let sep = minDist;
      while (attempts < 300) {
        const strip = pickStrip();
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
        if (attempts % 60 === 0 && sep > PIECE_SIZE * 0.6) {
          sep = Math.floor(sep * 0.9); // relax separation gradually
        }
      }
      placed.push(pos);
      positions.push(pos);
    });
    return positions;
  }, [puzzleWords, rows, cols, startX, startY, SLOT_SIZE, PIECE_SIZE]);
  
  // Randomize which pieces are pre-placed
  const prePlacedIndices = useMemo(() => {
    const indices = Array.from({ length: interactiveCount }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const chosen = indices.slice(0, prePlaced);
    const staticIndices = Array.from({ length: count - interactiveCount }, (_, i) => i + interactiveCount);
    return [...chosen, ...staticIndices];
  }, [count, interactiveCount, prePlaced]);

  // Refs for each piece: pan position, placed flag, and PanResponder
  // Refs for each piece: pan position, placed flag, and PanResponder
  // Track number of placed pieces (start with pre-placed count)
  const [placedCount, setPlacedCount] = useState(prePlacedIndices.length);
  // Notify parent when puzzle completes; overlay handled in GameRenderer
  useEffect(() => {
    if (placedCount === count && onWin) onWin();
  }, [placedCount, count, onWin]);
  // Reset placedCount when difficulty changes
  useEffect(() => {
    setPlacedCount(prePlacedIndices.length);
  }, [prePlacedIndices]);
  // Generate piece data (pan, placement flag, panResponder) per difficulty
  const pieces = useMemo(() => {
    return allWords.map((_, i) => {
      const isPrePlaced = prePlacedIndices.includes(i);
      const startPos = isPrePlaced ? slots[i] : initialPositions[i];
      const pan = new Animated.ValueXY({ x: startPos.x, y: startPos.y });
      const piece = { pan, placed: isPrePlaced, panResponder: null };
      if (!isPrePlaced) {
        piece.panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => !piece.placed,
          onMoveShouldSetPanResponder: () => !piece.placed,
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
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
              setPlacedCount(c => c + 1);
            }
          },
        });
      }
      return piece;
    });
  }, [allWords, prePlacedIndices, initialPositions, slots, PIECE_SIZE, SLOT_SIZE]);


  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Shape Builder</Text>
      <Text style={styles.description}>Drag each word into its outline slot.</Text>
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
      {/* Puzzle pieces including pre-placed ones */}
      {allWords.map((word, i) => {
        const { pan, panResponder, placed } = pieces[i];
        return (
          <PuzzlePiece
            key={i}
            word={word}
            connectors={connectors[i]}
            pan={pan}
            panResponder={panResponder}
            placed={placed}
            size={PIECE_SIZE}
          />
        );
      })}
      {/* Win overlay handled at parent */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.neutralLight,
  },
  title: {
    fontSize: 28,
    marginTop: 16,
    textAlign: 'center',
    color: themeVariables.primaryColorDark,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
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
});

export default ShapeBuilderGame;
