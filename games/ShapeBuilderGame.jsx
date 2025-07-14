import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import RewardBanner from '../components/RewardBanner';
import ThemedButton from '../components/ThemedButton';
import PuzzlePiece from '../components/PuzzlePiece';
import { useUser } from '../contexts/UserContext';
import { useDifficulty } from '../contexts/DifficultyContext';
import themeVariables from '../styles/theme';

// Dimensions and sizes
const { width, height } = Dimensions.get('window');
// Make puzzle pieces and slots same size for accurate fit
const PIECE_SIZE = 50;
const SLOT_SIZE = PIECE_SIZE;
const MARGIN = 10;

const ShapeBuilderGame = ({ quote, onBack, onWin }) => {
  // Get current user for personalized messages
  const { user } = useUser();
  // Difficulty settings: number of pieces and pre-completed count from global context
  const { level: difficulty, setLevel: setDifficulty } = useDifficulty();
  const pieceCounts = { 1: 8, 2: 16, 3: 24 };
  const prePlacedCounts = { 1: 2, 2: 4, 3: 6 };
  const pieceCount = pieceCounts[difficulty] || 8;
  const prePlaced = prePlacedCounts[difficulty] || 2;
  // Prepare words (slice according to difficulty)
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const allWords = text.split(/\s+/).filter(w => w.length > 0);
  const puzzleWords = allWords.slice(0, pieceCount);
  const count = puzzleWords.length;

  // Compute outline slot positions in 4x4 grid centered
  const cols = 4;
  // Compute number of rows based on piece count (4 columns)
  const rows = Math.ceil(count / cols);
  const totalW = cols * SLOT_SIZE + (cols - 1) * MARGIN;
  const totalH = rows * SLOT_SIZE + (rows - 1) * MARGIN;
  const startX = (width - totalW) / 2;
  const startY = (height - totalH) / 2;
  const slots = puzzleWords.map((_, idx) => {
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
    const placedPositions = [];
    const overlaps = (a, b) => Math.abs(a.x - b.x) < PIECE_SIZE && Math.abs(a.y - b.y) < PIECE_SIZE;
    const spawnEdges = ['top', 'left', 'right'];
    const spawnMargin = MARGIN;
    const puzzleWidth = cols * SLOT_SIZE + (cols - 1) * MARGIN;
    const puzzleHeight = rows * SLOT_SIZE + (rows - 1) * MARGIN;
    const puzzleMinX = startX;
    const puzzleMinY = startY;
    const puzzleMaxX = puzzleMinX + puzzleWidth - PIECE_SIZE;
    const puzzleMaxY = puzzleMinY + puzzleHeight - PIECE_SIZE;
    puzzleWords.forEach((_, idx) => {
      let pos;
      let attempts = 0;
      do {
        const edge = spawnEdges[Math.floor(Math.random() * spawnEdges.length)];
        let x = 0, y = 0;
        if (edge === 'top') {
          x = puzzleMinX + Math.random() * (puzzleMaxX - puzzleMinX);
          y = puzzleMinY - PIECE_SIZE - spawnMargin;
        } else if (edge === 'bottom') {
          x = puzzleMinX + Math.random() * (puzzleMaxX - puzzleMinX);
          y = puzzleMinY + puzzleHeight + spawnMargin;
        } else if (edge === 'left') {
          x = puzzleMinX - PIECE_SIZE - spawnMargin;
          y = puzzleMinY + Math.random() * (puzzleMaxY - puzzleMinY);
        } else {
          x = puzzleMinX + puzzleWidth + spawnMargin;
          y = puzzleMinY + Math.random() * (puzzleMaxY - puzzleMinY);
        }
        pos = { x, y };
        attempts++;
      } while (attempts < 100 && placedPositions.some(p => overlaps(p, pos)));
      placedPositions.push(pos);
      positions.push(pos);
    });
    return positions;
  }, [puzzleWords, rows, cols, startX, startY]);
  
  // Randomize which pieces are pre-placed
  const prePlacedIndices = useMemo(() => {
    const indices = Array.from({ length: count }, (_, i) => i);
    // Shuffle indices array
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Select first 'prePlaced' indices as pre-placed pieces
    return indices.slice(0, prePlaced);
  }, [count, prePlaced]);

  // Refs for each piece: pan position, placed flag, and PanResponder
  // Refs for each piece: pan position, placed flag, and PanResponder
  // Track number of placed pieces (start with pre-placed count)
  const [placedCount, setPlacedCount] = useState(prePlaced);
  // Show reward banner when puzzle completes
  const [showReward, setShowReward] = useState(false);
  useEffect(() => {
    if (placedCount === count) {
      setShowReward(true);
      if (onWin) onWin();
    }
  }, [placedCount, count]);
  // Reset placedCount when difficulty changes
  useEffect(() => {
    setPlacedCount(prePlaced);
  }, [prePlaced]);
  // Generate piece data (pan, placement flag, panResponder) per difficulty
  const pieces = useMemo(() => {
    return puzzleWords.map((_, i) => {
      const isPrePlaced = prePlacedIndices.includes(i);
      const startPos = isPrePlaced ? slots[i] : initialPositions[i];
      const pan = new Animated.ValueXY({ x: startPos.x, y: startPos.y });
      const piece = { pan, placed: isPrePlaced, panResponder: null };
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
      return piece;
    });
  }, [difficulty, prePlacedIndices]);


  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Shape Builder</Text>
      <Text style={styles.description}>Drag each word into its outline slot.</Text>
      {/* Outline slots with matching connectors */}
      {slots.map((pos, i) => {
        const { top: topType, right: rightType, bottom: bottomType, left: leftType } = connectors[i];
        const bump = PIECE_SIZE / 3;
        return (
          <View
            key={i}
            style={[
              styles.slot,
              { left: pos.x, top: pos.y, width: SLOT_SIZE, height: SLOT_SIZE },
            ]}
          >
            {/* Top connector */}
            {topType === 'convex' && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: SLOT_SIZE / 2 - bump / 2,
                width: bump,
                height: bump / 2,
                backgroundColor: themeVariables.neutralDark,
                borderColor: themeVariables.primaryColor,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderTopWidth: 0,
                borderBottomLeftRadius: bump / 2,
                borderBottomRightRadius: bump / 2,
              }} />
            )}
            {topType === 'concave' && (
              <View style={{
                position: 'absolute',
                top: -bump / 2,
                left: SLOT_SIZE / 2 - bump / 2,
                width: bump,
                height: bump / 2,
                backgroundColor: themeVariables.primaryColorLight,
                borderColor: themeVariables.primaryColor,
                borderWidth: 1,
                borderTopLeftRadius: bump / 2,
                borderTopRightRadius: bump / 2,
              }} />
            )}
            {/* Bottom connector */}
            {bottomType === 'convex' && (
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: SLOT_SIZE / 2 - bump / 2,
                width: bump,
                height: bump / 2,
                backgroundColor: themeVariables.neutralDark,
                borderColor: themeVariables.primaryColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: 0,
                borderTopLeftRadius: bump / 2,
                borderTopRightRadius: bump / 2,
              }} />
            )}
            {bottomType === 'concave' && (
              <View style={{
                position: 'absolute',
                bottom: -bump / 2,
                left: SLOT_SIZE / 2 - bump / 2,
                width: bump,
                height: bump / 2,
                backgroundColor: themeVariables.primaryColorLight,
                borderColor: themeVariables.primaryColor,
                borderWidth: 1,
                borderBottomLeftRadius: bump / 2,
                borderBottomRightRadius: bump / 2,
              }} />
            )}
            {/* Left connector */}
            {leftType === 'convex' && (
              <View style={{
                position: 'absolute',
                left: 0,
                top: SLOT_SIZE / 2 - bump / 2,
                width: bump / 2,
                height: bump,
                backgroundColor: themeVariables.neutralDark,
                borderColor: themeVariables.primaryColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderLeftWidth: 0,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderTopRightRadius: bump / 2,
                borderBottomRightRadius: bump / 2,
              }} />
            )}
            {leftType === 'concave' && (
              <View style={{
                position: 'absolute',
                left: -bump / 2,
                top: SLOT_SIZE / 2 - bump / 2,
                width: bump / 2,
                height: bump,
                backgroundColor: themeVariables.primaryColorLight,
                borderColor: themeVariables.primaryColor,
                borderWidth: 1,
                borderTopLeftRadius: bump / 2,
                borderBottomLeftRadius: bump / 2,
              }} />
            )}
            {/* Right connector */}
            {rightType === 'convex' && (
              <View style={{
                position: 'absolute',
                right: 0,
                top: SLOT_SIZE / 2 - bump / 2,
                width: bump / 2,
                height: bump,
                backgroundColor: themeVariables.neutralDark,
                borderColor: themeVariables.primaryColor,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderRightWidth: 0,
                borderTopLeftRadius: bump / 2,
                borderBottomLeftRadius: bump / 2,
              }} />
            )}
            {rightType === 'concave' && (
              <View style={{
                position: 'absolute',
                right: -bump / 2,
                top: SLOT_SIZE / 2 - bump / 2,
                width: bump / 2,
                height: bump,
                backgroundColor: themeVariables.primaryColorLight,
                borderColor: themeVariables.primaryColor,
                borderWidth: 1,
                borderTopRightRadius: bump / 2,
                borderBottomRightRadius: bump / 2,
              }} />
            )}
          </View>
        );
      })}
      {/* Draggable puzzle pieces */}
      {puzzleWords.map((word, i) => {
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
      {/* Reward banner on win */}
      {showReward && (
        <RewardBanner
          text={`Well Done${user?.firstName ? `, ${user.firstName}` : ''}!`}
          onAnimationEnd={() => setShowReward(false)}
        />
      )}
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