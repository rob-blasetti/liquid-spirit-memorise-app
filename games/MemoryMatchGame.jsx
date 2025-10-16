import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useDifficulty } from '../contexts/DifficultyContext';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';
// Lost overlay handled by parent GameRenderer

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const MemoryMatchGame = ({ quote, onBack, onWin, onLose }) => {
  const { level } = useDifficulty();
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  // Win banner handled by GameRenderer overlay via onWin
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [pairWords, setPairWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(new Set());
  const [preview, setPreview] = useState(null); // { word: string, revealed: boolean }
  const previewFlip = useRef(new Animated.Value(0)).current; // 0 => 90deg, 1 => 0deg
  const previewTimer = useRef(null);
  // Cache callbacks to avoid firing multiple times when parent re-renders
  const winCallbackRef = useRef(onWin);
  const loseCallbackRef = useRef(onLose);
  useEffect(() => {
    winCallbackRef.current = onWin;
  }, [onWin]);
  useEffect(() => {
    loseCallbackRef.current = onLose;
  }, [onLose]);
  // Notify parent on terminal states without re-triggering on parent changes
  useEffect(() => {
    if (status === 'won') {
      winCallbackRef.current?.();
    } else if (status === 'lost') {
      loseCallbackRef.current?.();
    }
  }, [status]);

  const initGame = useCallback(() => {
    const words = text.split(/\s+/);
    const uniqueWords = Array.from(new Set(words));
    const dimension = level + 3; // base difficulty factor
    const totalTiles = dimension * dimension; // used only to scale difficulty
    const numPairs = Math.floor(totalTiles / 2);
    const selectedWords = uniqueWords.slice(0, numPairs);
    const initialGuesses = numPairs * 2;
    let pairs = shuffle(
      selectedWords.flatMap((w) => [
        { id: `${w}-1`, word: w, matched: false },
        { id: `${w}-2`, word: w, matched: false },
      ]),
    );
    // Do not add any blank placeholder tiles; only actual word pairs are included
    setCards(pairs);
    setSelected([]);
    setStatus('playing');
    setGuessesLeft(initialGuesses);
    setPairWords(selectedWords);
    setRevealedWords(new Set());
  }, [text, level]);
  useEffect(() => {
    initGame();
  }, [initGame]);
  const handlePress = (card) => {
    if (status !== 'playing' || card.matched || selected.find((c) => c.id === card.id)) return;
    const newSelected = [...selected, card];
    // Show enlarged preview (as a flipped front) if cards are small
    const isSmall = cardWidth < 60;
    if (isSmall) {
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = null;
      }
      setPreview({ word: card.word, revealed: true });
      previewFlip.setValue(0);
      // animate flip-in to front
      Animated.timing(previewFlip, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      // hold then flip-out and clear
      previewTimer.current = setTimeout(() => {
        Animated.timing(previewFlip, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setPreview(null);
        });
      }, 650);
    }
    setSelected(newSelected);
    if (newSelected.length === 2) {
      if (newSelected[0].word === newSelected[1].word) {
        setCards((prev) => {
          const updated = prev.map((c) =>
            c.word === card.word ? { ...c, matched: true } : c,
          );
          // if all cards matched, win
          if (updated.every((c2) => c2.matched)) {
            setStatus('won');
          }
          return updated;
        });
        // reveal this word in the slate to a highly legible color
        setRevealedWords((prev) => {
          const next = new Set(prev);
          next.add(card.word);
          return next;
        });
        setSelected([]);
      } else {
        // decrement guesses and check loss
        setGuessesLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) setStatus('lost');
          return next;
        });
        setTimeout(() => setSelected([]), 700);
      }
    }
  };

  const isRevealed = (card) =>
    card.matched || selected.find((c) => c.id === card.id) || status !== 'playing';

  // Compute rows/columns for layout
  const dimension = level + 3; // base dimension for total tiles used to seed pairs
  const totalCards = cards.length || 0;
  let columns = 1;
  let rows = 0;
  if (totalCards > 0) {
    const root = Math.floor(Math.sqrt(totalCards));
    if (root * root === totalCards) {
      columns = root;
      rows = root;
    } else {
      columns = Math.ceil(Math.sqrt(totalCards)); // extend horizontally first
      rows = Math.ceil(totalCards / columns);
    }
  }
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const [gridLayout, setGridLayout] = useState({ width: SCREEN_WIDTH, height: 400 });
  const cardMargin = 4;
  // compute card size constrained by both width and height so cards always fit within grid width
  const widthBound = Math.max(40, Math.floor((gridLayout.width - cardMargin * 2 * columns) / columns));
  // reserve space at bottom for guesses card; align with FAB bottom (54)
  const bottomOffset = 54; // align bottom edge with Difficulty FAB
  const guessesCardHeightEst = Math.max(48, Math.min(72, Math.floor((widthBound * 1.35) * 0.8)));
  const bottomReserve = guessesCardHeightEst + bottomOffset + 8; // ensure space for guesses bubble at bottom
  const usableHeight = Math.max(120, gridLayout.height - bottomReserve);
  const heightBoundPerCard = Math.max(40, Math.floor((usableHeight - cardMargin * 2 * rows) / rows));
  // maintain aspect ratio ~1:1.35 (w:h)
  const widthFromHeight = Math.floor(heightBoundPerCard / 1.35);
  const cardWidth = Math.max(40, Math.min(widthBound, widthFromHeight));
  const cardHeight = Math.floor(cardWidth * 1.35);

  const words = text.split(/\s+/);
  // Derive pair words immediately for initial render to avoid slate flashing full quote
  const computedDefaultPairWords = (() => {
    const uniq = Array.from(new Set(words));
    const dimensionBase = level + 3;
    const targetPairs = Math.floor((dimensionBase * dimensionBase) / 2);
    return uniq.slice(0, targetPairs);
  })();
  const effectivePairWords = pairWords && pairWords.length > 0 ? pairWords : computedDefaultPairWords;
  const pairWordSet = new Set(effectivePairWords);
  const [topArea, setTopArea] = useState({ y: 0, height: 160 });
  // Preview sizing/position: 2x card size but constrained to top area and screen width
  const previewBaseW = cardWidth * 2.5;
  const previewBaseH = cardHeight * 2.5;
  const availableW = SCREEN_WIDTH * 0.9;
  const availableH = Math.max(80, topArea.height - 8);
  const previewScale = Math.min(1, availableW / previewBaseW, availableH / previewBaseH);
  const previewW = Math.max(80, Math.floor(previewBaseW * previewScale));
  const previewH = Math.max(80, Math.floor(previewBaseH * previewScale));
  const previewTop = Math.max(0, topArea.y + Math.floor((topArea.height - previewH) / 2));
  return (
    <View style={styles.container}>
      {/* Win overlay handled at parent */}
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <View onLayout={(e) => setTopArea({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })}>
        <View style={styles.titleRow}>
          <View style={styles.titleCards}>
            <View style={[styles.titleCard, styles.titleCardBack]} />
            <View style={[styles.titleCard, styles.titleCardFront]} />
          </View>
          <Text style={styles.title}>Memory Match</Text>
        </View>
        <View style={styles.titleUnderline} />
        {/* Slate showing the quote for context */}
        <View style={styles.slate}>
          <View style={styles.slateInner}>
            {words.map((w, i) => {
              const isPairWord = pairWordSet.has(w);
              const isRevealedWord = revealedWords.has(w);
              const showWord = !isPairWord || isRevealedWord;
              return (
                <View key={`slate-${i}`} style={styles.slateWordWrap}>
                  {showWord ? (
                    <Text style={[styles.slateWord, isPairWord && isRevealedWord ? styles.slateWordRevealed : styles.slateWordDim]}>{w}</Text>
                  ) : (
                    <Text style={styles.slateWordPlaceholder}>{Array(w.length).fill('_').join('')}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
      <View
        style={[styles.grid, { paddingBottom: bottomReserve }]}
        onLayout={(e) => setGridLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowCards = cards.slice(rowIdx * columns, (rowIdx + 1) * columns);
          return (
            <View key={rowIdx} style={styles.row}>
              {rowCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      height: cardHeight,
                      borderRadius: Math.round(cardWidth * 0.12),
                      backgroundColor: isRevealed(card)
                        ? themeVariables.whiteColor
                        : themeVariables.primaryColor,
                      borderColor: isRevealed(card)
                        ? themeVariables.borderColor
                        : 'rgba(255,255,255,0.7)',
                      shadowOpacity: 0.2,
                    },
                  ]}
                  onPress={() => handlePress(card)}
                >
                  {!isRevealed(card) && (
                    <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject }}>
                      {/* diagonal soft shine band */}
                      <View
                        pointerEvents="none"
                        style={[
                          styles.cardBackShineDiag,
                          { borderRadius: Math.round(cardWidth * 0.12) },
                        ]}
                      />
                      {/* subtle inner border glow */}
                      <View
                        pointerEvents="none"
                        style={[
                          styles.cardInnerBorder,
                          { borderRadius: Math.round(cardWidth * 0.1) },
                        ]}
                      />
                      {/* decorative stripes */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <View
                          key={`stripe-${card.id}-${i}`}
                          pointerEvents="none"
                          style={[
                            styles.cardStripe,
                            {
                              left: -cardHeight + i * Math.max(18, Math.floor(cardWidth * 0.22)),
                              height: cardHeight * 2.2,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  <Text
                    style={[
                      styles.cardText,
                      {
                        color: isRevealed(card)
                          ? themeVariables.primaryColor
                          : themeVariables.whiteColor,
                        fontSize: cardWidth > 60 ? 14 : 12,
                        paddingHorizontal: 6,
                        alignSelf: 'stretch',
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {isRevealed(card) ? card.word : '?'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
      {/* Guesses card at bottom-left styled like a card */}
      {status === 'playing' && (
        <View style={[styles.guessCardContainer, { bottom: bottomOffset }]} pointerEvents="none">
          <View
            style={[
              styles.card,
              styles.guessCard,
              {
                width: Math.max(84, Math.min(120, cardWidth * 2)),
                height: guessesCardHeightEst,
              },
            ]}
          >
            <Text style={[styles.cardText, { color: themeVariables.primaryColor }]}>Guesses: {guessesLeft}</Text>
          </View>
        </View>
      )}
      {/* No win text here; WinOverlay handles success messaging */}
      {/* Loss overlay handled by GameRenderer */}
      {/* Enlarged preview overlay when cards are tiny */}
      {preview && (
        <View
          pointerEvents="none"
          style={[
            styles.previewOverlay,
            { top: previewTop, height: previewH, left: 0, right: 0 },
          ]}
        >
          <Animated.View
            style={[
              styles.previewCard,
              {
                width: previewW,
                height: previewH,
                backgroundColor: themeVariables.whiteColor,
                borderColor: themeVariables.borderColor,
                transform: [
                  { perspective: 800 },
                  {
                    rotateY: previewFlip.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['90deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.cardText,
                {
                  color: themeVariables.primaryColor,
                  fontSize: 24,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {preview.word}
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
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
    paddingLeft: 56,
    marginTop: 0,
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
  titleCards: {
    width: 54,
    height: 40,
    marginRight: 6,
    position: 'relative',
  },
  titleCard: {
    position: 'absolute',
    width: 40,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  titleCardBack: {
    backgroundColor: themeVariables.primaryColor,
    borderColor: 'rgba(255,255,255,0.7)',
    left: 6,
    top: 8,
    transform: [{ rotate: '-14deg' }],
  },
  titleCardFront: {
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.borderColor,
    left: 16,
    top: 2,
    transform: [{ rotate: '10deg' }],
  },
  slate: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    padding: 12,
    // Match Bubble Pop slate for consistency and to prevent bleed-through
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  slateInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slateWordWrap: {
    marginRight: 6,
    marginBottom: 4,
  },
  slateWord: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Noto Sans',
    // Subtle shadow for readability on dark slate
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slateWordDim: {
    color: 'rgba(255,255,255,0.65)',
  },
  slateWordRevealed: {
    color: themeVariables.whiteColor,
  },
  slateWordPlaceholder: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Noto Sans',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flex: 1,
    width: '100%',
    marginHorizontal: -16, // consume horizontal padding so grid spans full width
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInnerBorder: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardBackShineDiag: {
    position: 'absolute',
    top: -20,
    left: -40,
    width: '180%',
    height: '60%',
    transform: [{ rotate: '-18deg' }],
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardStripe: {
    position: 'absolute',
    top: -20,
    width: 14,
    transform: [{ rotate: '40deg' }],
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardText: {
    fontSize: 12,
    color: themeVariables.primaryColor,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Noto Sans',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  guessCardContainer: {
    position: 'absolute',
    left: 16,
  },
  guessCard: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
  playButton: {
    width: '80%',
    marginTop: 16,
  },
});

export default MemoryMatchGame;
