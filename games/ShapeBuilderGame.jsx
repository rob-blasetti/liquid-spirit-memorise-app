import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import RewardBanner from '../components/RewardBanner';
import ThemedButton from '../components/ThemedButton';
import { useUser } from '../contexts/UserContext';
import themeVariables from '../styles/theme';

// Dimensions and sizes
const { width, height } = Dimensions.get('window');
// Make puzzle pieces and slots same size for accurate fit
const PIECE_SIZE = 50;
const SLOT_SIZE = PIECE_SIZE;
const MARGIN = 10;

const ShapeBuilderGame = ({ quote, onBack }) => {
  // Get current user for personalized messages
  const { user } = useUser();
  // Difficulty settings: number of pieces and pre-completed count
  const [difficulty, setDifficulty] = useState(1);
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
  const opposite = (t) => t === 'convex' ? 'concave' : t === 'concave' ? 'convex' : 'flat';
  const connectors = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let top = r === 0 ? 'flat' : opposite(connectors[(r - 1) * cols + c].bottom);
      let left = c === 0 ? 'flat' : opposite(connectors[r * cols + (c - 1)].right);
      let right = c === cols - 1 ? 'flat' : (Math.random() < 0.5 ? 'convex' : 'concave');
      let bottom = r === rows - 1 ? 'flat' : (Math.random() < 0.5 ? 'convex' : 'concave');
      connectors[i] = { top, right, bottom, left };
    }
  }
  // Compute initial positions of pieces scattered around puzzle perimeter (no overlap)
  // Only use top, left, and right edges
  const spawnEdges = ['top', 'left', 'right'];
  const placedPositions = [];
  const overlaps = (a, b) => Math.abs(a.x - b.x) < PIECE_SIZE && Math.abs(a.y - b.y) < PIECE_SIZE;
  const spawnMargin = MARGIN;
  // Puzzle bounding box
  const puzzleWidth = cols * SLOT_SIZE + (cols - 1) * MARGIN;
  const puzzleHeight = rows * SLOT_SIZE + (rows - 1) * MARGIN;
  const puzzleMinX = startX;
  const puzzleMinY = startY;
  const puzzleMaxX = puzzleMinX + puzzleWidth - PIECE_SIZE;
  const puzzleMaxY = puzzleMinY + puzzleHeight - PIECE_SIZE;
  const initialPositions = puzzleWords.map((_, idx) => {
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
    return pos;
  });

  // Refs for each piece: pan position, placed flag, and PanResponder
  // Refs for each piece: pan position, placed flag, and PanResponder
  // Track number of placed pieces (start with pre-placed count)
  const [placedCount, setPlacedCount] = useState(prePlaced);
  // Show reward banner when puzzle completes
  const [showReward, setShowReward] = useState(false);
  useEffect(() => {
    if (placedCount === count) {
      setShowReward(true);
    }
  }, [placedCount, count]);
  // Reset placedCount when difficulty changes
  useEffect(() => {
    setPlacedCount(prePlaced);
  }, [prePlaced]);
  // Generate piece data (pan, placement flag, panResponder) per difficulty
  const pieces = useMemo(() => {
    return puzzleWords.map((_, i) => {
      const startPos = i < prePlaced ? slots[i] : initialPositions[i];
      const pan = new Animated.ValueXY({ x: startPos.x, y: startPos.y });
      const piece = { pan, placed: i < prePlaced, panResponder: null };
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
  }, [difficulty]);


  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Shape Builder</Text>
      <Text style={styles.description}>Drag each word into its outline slot.</Text>
      {/* Outline slots */}
      {slots.map((pos, i) => (
        <View
          key={i}
          style={[
            styles.slot,
            { left: pos.x, top: pos.y, width: SLOT_SIZE, height: SLOT_SIZE },
          ]}
        />
      ))}
      {/* Draggable puzzle pieces */}
      {puzzleWords.map((word, i) => {
        const { pan, panResponder, placed } = pieces[i];
        // Jigsaw connector types for each side
        const { top: topType, right: rightType, bottom: bottomType, left: leftType } = connectors[i];
        const bump = PIECE_SIZE / 3;
        return (
          <Animated.View
            key={i}
            {...(panResponder && panResponder.panHandlers)}
            style={[
              styles.piece,
              {
                width: PIECE_SIZE,
                height: PIECE_SIZE,
                borderRadius: PIECE_SIZE / 10,
                transform: pan.getTranslateTransform(),
              },
              placed && { backgroundColor: themeVariables.primaryColor },
            ]}
          >
            {/* Render bumps only when not placed */}
            {!placed && (
              <>
                {/* Convex bumps */}
                {topType === 'convex' && <View style={[styles.bump, { top: -bump/2, left: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {bottomType === 'convex' && <View style={[styles.bump, { bottom: -bump/2, left: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {leftType === 'convex' && <View style={[styles.bump, { left: -bump/2, top: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {rightType === 'convex' && <View style={[styles.bump, { right: -bump/2, top: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {/* Concave cut-outs */}
                {topType === 'concave' && <View style={[styles.cut, { top: bump/2, left: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {bottomType === 'concave' && <View style={[styles.cut, { bottom: bump/2, left: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {leftType === 'concave' && <View style={[styles.cut, { left: bump/2, top: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
                {rightType === 'concave' && <View style={[styles.cut, { right: bump/2, top: PIECE_SIZE/2 - bump/2, width: bump, height: bump }]} />}
              </>
            )}
            {/* Always render word; use white text when placed */}
            <Text style={[styles.word, placed && styles.placedWord]}>
              {word}
            </Text>
          </Animated.View>
        );
      })}
      {/* Reward banner on win */}
      {showReward && (
        <RewardBanner
          text={`Well Done${user?.firstName ? `, ${user.firstName}` : ''}!`}
          onAnimationEnd={() => setShowReward(false)}
        />
      )}
      {/* Difficulty selection buttons */}
      <View style={styles.buttonsContainer}>
        <ThemedButton
          title="Level 1"
          onPress={() => setDifficulty(1)}
          disabled={difficulty === 1}
          style={styles.buttonMargin}
        />
        <ThemedButton
          title="Level 2"
          onPress={() => setDifficulty(2)}
          disabled={difficulty === 2}
          style={styles.buttonMargin}
        />
        <ThemedButton
          title="Level 3"
          onPress={() => setDifficulty(3)}
          disabled={difficulty === 3}
        />
      </View>
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