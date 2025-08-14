import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BubblePopOrderGame = ({ quote, onBack, onWin, level }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  // Limit bubbles based on difficulty level
  const allWords = text.split(/\s+/);
  const maxBubbles = level === 1 ? 8 : level === 2 ? 16 : 32;
  const bubbleCount = Math.min(maxBubbles, allWords.length);
  const bubbleIndices = useMemo(() => {
    // pick unique random indices across the quote, preserve reading order
    const indices = new Set();
    while (indices.size < bubbleCount) {
      const idx = Math.floor(Math.random() * allWords.length);
      indices.add(idx);
    }
    return Array.from(indices).sort((a, b) => a - b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, level]);
  const bubbleOrderMap = useMemo(() => {
    const m = new Map();
    bubbleIndices.forEach((idx, order) => m.set(idx, order));
    return m;
  }, [bubbleIndices]);
  const bubbledSet = useMemo(() => new Set(bubbleIndices), [bubbleIndices]);
  const bubbleWords = useMemo(() => bubbleIndices.map(i => allWords[i]), [bubbleIndices, allWords]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [bubbles, setBubbles] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const shimmerValuesRef = useRef([]);
  // Compute remaining wrong taps based on difficulty
  const wrongLimit = level === 1 ? 5 : level === 2 ? 3 : 1;
  const remainingGuesses = Math.max(0, wrongLimit - wrongCount);

  // initialize bubbles with bubble-like visuals, motion, and some overlap allowed
  useEffect(() => {
    const intensity = level === 1 ? 1.0 : level === 2 ? 1.2 : 1.4;
    const items = bubbleWords.map((w, i) => {
      // estimate bubble size based on word length and add size variance
      const charWidth = 9; const paddingH = 18 * 2;
      const paddingV = 12 * 2; const fontSize = 18;
      const baseWidth = w.length * charWidth + paddingH;
      const baseHeight = fontSize + paddingV;
      const sizeJitter = 0.85 + Math.random() * 0.6; // 0.85x - 1.45x
      const wWidth = Math.max(56, baseWidth * sizeJitter);
      const wHeight = Math.max(56, baseHeight * sizeJitter);

      // allow overlaps: pick a random position in the middle band of the screen
      const x = Math.random() * (SCREEN_WIDTH - wWidth);
      const y = Math.random() * (SCREEN_HEIGHT * 0.45) + SCREEN_HEIGHT * 0.3;

      // animations: vertical bob, horizontal sway, subtle pulse
      const bob = new Animated.Value(0);
      const sway = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const opacity = new Animated.Value(0.85);
      const ringScale = new Animated.Value(0.6);
      const ringOpacity = new Animated.Value(0);
      const shake = new Animated.Value(0);

      // Bob up and down like buoyancy
      const bobDistance = (12 + Math.random() * 10) * 1; // keep motion gentle
      const bobDuration = 2200 + Math.random() * 1400;
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: -bobDistance, duration: bobDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bob, { toValue: bobDistance, duration: bobDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();

      // Sway left-right gently
      const swayDistance = 10 + Math.random() * 16;
      const swayDuration = 2600 + Math.random() * 1600;
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: -swayDistance, duration: swayDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sway, { toValue: swayDistance, duration: swayDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();

      // Subtle breathing scale and shimmer opacity
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.04, duration: 1800 + Math.random() * 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.98, duration: 1800 + Math.random() * 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 1600 + Math.random() * 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 1600 + Math.random() * 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ).start();

      return { word: w, id: i, x, y, wWidth, wHeight, bob, sway, scale, opacity, ringScale, ringOpacity, shake, popped: false, intensity };
    });
    setBubbles(items);
    setIndex(0);
    setMessage('');
    setWrongCount(0);
    // initialize per-word shimmer animators
    shimmerValuesRef.current = allWords.map(() => new Animated.Value(0));
  }, [text, level, bubbleWords.length]);

  // no title animation per request

  const handlePress = (id) => {
    // prevent interaction after win or too many wrong taps
    const wrongLimit = level === 1 ? 5 : level === 2 ? 3 : 1;
    if (wrongCount >= wrongLimit || index >= bubbleWords.length) return;
    setBubbles((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== id || b.popped) return b;
        const targetWord = bubbleWords[index];
        if (b.word === targetWord) {
          // pop: quick scale-out and ring burst
          const ringTarget = 1.4 + 0.2 * (level - 1);
          Animated.parallel([
            Animated.timing(b.scale, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(b.ringOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
              Animated.parallel([
                Animated.timing(b.ringScale, { toValue: ringTarget, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(b.ringOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
              ]),
            ]),
          ]).start();
          b.popped = true;
          const currentCorrect = index;
          const next = index + 1;
          // trigger shimmer for the newly revealed word on the slate
          const revealIdx = bubbleIndices[currentCorrect];
          const anim = shimmerValuesRef.current[revealIdx];
          if (anim) {
            anim.setValue(0);
            Animated.timing(anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
          }
          setIndex(next);
          if (next === bubbleWords.length) {
            setMessage('Great job!');
            if (onWin) {
              // defer onWin to avoid state updates during render phase
              setTimeout(() => onWin(), 0);
            }
          } else {
            setMessage('');
          }
        } else {
          // wrong tap
          const amp = level === 1 ? 8 : level === 2 ? 12 : 16;
          const minScale = level === 1 ? 0.95 : level === 2 ? 0.92 : 0.88;
          Animated.parallel([
            Animated.sequence([
              Animated.timing(b.shake, { toValue: -amp, duration: 70, useNativeDriver: true }),
              Animated.timing(b.shake, { toValue: amp, duration: 90, useNativeDriver: true }),
              Animated.timing(b.shake, { toValue: -amp * 0.6, duration: 60, useNativeDriver: true }),
              Animated.timing(b.shake, { toValue: amp * 0.6, duration: 60, useNativeDriver: true }),
              Animated.timing(b.shake, { toValue: 0, duration: 80, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(b.scale, { toValue: minScale, duration: 120, useNativeDriver: true }),
              Animated.timing(b.scale, { toValue: 1, duration: 120, useNativeDriver: true }),
            ]),
          ]).start();
          setMessage('Try again');
          setWrongCount((prevCount) => {
            const limit = level === 1 ? 5 : level === 2 ? 3 : 1;
            const newCount = prevCount + 1;
            if (newCount >= limit) {
              setMessage('Game Over');
              // return to previous screen after a short delay
              setTimeout(() => onBack(), 1000);
            }
            return newCount;
          });
        }
        return b;
      });
      return [...updated];
    });
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      {/* Heading aligned similarly to Shape Builder */}
      <View style={styles.titleRow}>
        <View style={styles.titleBubbles}>
          <View style={[styles.titleBubble, styles.titleBubbleBack]}>
            <View pointerEvents="none" style={styles.titleBubbleShine} />
          </View>
          <View style={[styles.titleBubble, styles.titleBubbleFront]}>
            <View pointerEvents="none" style={styles.titleBubbleShine} />
          </View>
        </View>
        <Text style={styles.title}>Bubble Pop</Text>
      </View>
      {/* Slate showing full quote; bubbled words are hidden until popped */}
      <View style={styles.slate}>
        <View style={styles.slateInner}>
          {allWords.map((w, i) => {
            const isBubbled = bubbledSet.has(i);
            const orderIndex = bubbleOrderMap.get(i);
            const isVisible = !isBubbled || (orderIndex !== undefined && orderIndex < index);
            const appear = shimmerValuesRef.current[i] || new Animated.Value(isVisible ? 1 : 0);
            return (
              <View key={`slate-word-${i}`} style={styles.slateWordWrap}>
                {isVisible ? (
                  <Animated.View style={{ transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }], opacity: appear.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }}>
                    <Text style={styles.slateWord}>{w}</Text>
                    {/* simple shimmer bar sweeps across the word */}
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.slateShimmer,
                        {
                          transform: [{ translateX: appear.interpolate({ inputRange: [0, 1], outputRange: [-30, 60] }) }],
                          opacity: appear.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                        },
                      ]}
                    />
                  </Animated.View>
                ) : (
                  <Text style={styles.slateWordPlaceholder}>
                    {Array(w.length).fill('_').join('')}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
      {bubbles.map((b) =>
        !b.popped && (
          <TouchableWithoutFeedback key={b.id} onPress={() => handlePress(b.id)}>
            <Animated.View
              style={[
                styles.bubble,
                {
                  left: b.x,
                  top: b.y,
                  width: b.wWidth,
                  height: b.wHeight,
                  borderRadius: Math.max(b.wWidth, b.wHeight) / 2,
                  zIndex: Math.round(1000 - b.y),
                  opacity: b.opacity,
                  transform: [{ translateY: b.bob }, { translateX: b.sway }, { translateX: b.shake }, { scale: b.scale }],
                },
              ]}
            >
              {/* bubble shine/highlight layers */}
              <View pointerEvents="none" style={styles.bubbleInner} />
              <View pointerEvents="none" style={styles.bubbleShine} />
              <Animated.View pointerEvents="none" style={[styles.popRing, { transform: [{ scale: b.ringScale }], opacity: b.ringOpacity }]} />
              <Text style={styles.word}>{b.word}</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        ),
      )}
      <View style={styles.remainingContainer}>
        <View pointerEvents="none" style={styles.remainingInner} />
        <View pointerEvents="none" style={styles.remainingShine} />
        <Text style={styles.remainingText}>Taps left: {remainingGuesses}</Text>
      </View>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'top',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingLeft: 64,
    paddingRight: 60, // balance left-side bubble motif so text centers under island
    marginTop: 16,
  },
  titleBubbles: {
    width: 54,
    height: 40,
    marginRight: 6,
    position: 'relative',
  },
  titleBubble: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  titleBubbleBack: {
    left: 6,
    top: 8,
  },
  titleBubbleFront: {
    left: 16,
    top: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  titleBubbleShine: {
    position: 'absolute',
    top: '12%',
    left: '16%',
    width: '42%',
    height: '28%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ rotate: '-18deg' }],
  },
  title: {
    fontSize: 24,
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    color: themeVariables.whiteColor,
    letterSpacing: 1,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontFamily: 'Noto Sans',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: themeVariables.whiteColor
  },
  slate: {
    width: '90%',
    minHeight: 82,
    maxHeight: 140,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginTop: 12,
    marginBottom: 10,
  },
  slateInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slateWordWrap: {
    position: 'relative',
    marginRight: 6,
    marginBottom: 4,
  },
  slateWord: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Noto Sans',
  },
  slateWordPlaceholder: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Noto Sans',
  },
  slateShimmer: {
    position: 'absolute',
    left: -30,
    top: '10%',
    width: 24,
    height: '80%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', // translucent bubble body
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  bubbleInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bubbleShine: {
    position: 'absolute',
    top: '10%',
    left: '12%',
    width: '35%',
    height: '25%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 9999,
    transform: [{ rotate: '-20deg' }],
  },
  popRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  word: {
    color: themeVariables.whiteColor,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Noto Sans',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
  remainingContainer: {
    position: 'absolute',
    left: 16,
    bottom: 80,
    backgroundColor: 'rgba(88,219,51,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  remainingText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '700',
  },
  remainingInner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  remainingShine: {
    position: 'absolute',
    top: '10%',
    left: '12%',
    width: '30%',
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 9999,
    transform: [{ rotate: '-20deg' }],
  },
});

export default BubblePopOrderGame;
