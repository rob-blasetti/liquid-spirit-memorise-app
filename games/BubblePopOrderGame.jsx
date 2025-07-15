import React, { useEffect, useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BubblePopOrderGame = ({ quote, onBack, onWin, level }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  // Limit bubbles based on difficulty level
  const allWords = text.split(/\s+/);
  const maxBubbles = level === 1 ? 8 : level === 2 ? 16 : 32;
  const words = allWords.slice(0, maxBubbles);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [bubbles, setBubbles] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  // Compute remaining wrong taps based on difficulty
  const wrongLimit = level === 1 ? 5 : level === 2 ? 3 : 1;
  const remainingGuesses = Math.max(0, wrongLimit - wrongCount);

  // initialize bubbles with non-overlapping positions
  useEffect(() => {
    const placements = [];
    const items = words.map((w, i) => {
      // estimate bubble size based on word length
      const charWidth = 10; const paddingH = 16 * 2;
      const paddingV = 12 * 2; const fontSize = 18;
      const wWidth = w.length * charWidth + paddingH;
      const wHeight = fontSize + paddingV;
      const radius = Math.max(wWidth, wHeight) / 2;
      // find non-overlapping position
      let x, y, cx, cy, tries = 0;
      do {
        x = Math.random() * (SCREEN_WIDTH - wWidth);
        y = Math.random() * (SCREEN_HEIGHT / 2) + SCREEN_HEIGHT / 4;
        cx = x + wWidth / 2;
        cy = y + wHeight / 2;
        tries++;
        // avoid infinite loop
        if (tries > 100) break;
      } while (
        placements.some(p => {
          const dx = p.cx - cx;
          const dy = p.cy - cy;
          return Math.sqrt(dx * dx + dy * dy) < (p.radius + radius);
        })
      );
      placements.push({ cx, cy, radius });
      const floatAnim = new Animated.Value(0);
      const scale = new Animated.Value(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 10,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
      return { word: w, id: i, x, y, floatAnim, scale, popped: false };
    });
    setBubbles(items);
    setIndex(0);
    setMessage('');
    setWrongCount(0);
  }, [text, level]);

  const handlePress = (id) => {
    // prevent interaction after win or too many wrong taps
    const wrongLimit = level === 1 ? 5 : level === 2 ? 3 : 1;
    if (wrongCount >= wrongLimit || index >= words.length) return;
    setBubbles((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== id || b.popped) return b;
        if (b.word === words[index]) {
          Animated.timing(b.scale, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          b.popped = true;
          const next = index + 1;
          setIndex(next);
          if (next === words.length) {
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
          Animated.sequence([
            Animated.timing(b.scale, { toValue: 0.5, duration: 150, useNativeDriver: true }),
            Animated.timing(b.scale, { toValue: 1, duration: 150, useNativeDriver: true }),
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
      <GameTopBar onBack={onBack} iconColor={themeVariables.whiteColor} />
      {/* Remaining wrong taps counter */}
      <Text style={styles.remaining}>Taps left: {remainingGuesses}</Text>
      <Text style={styles.title}>Bubble Pop Order</Text>
      <Text style={styles.description}>Pop the words in the correct order.</Text>
      {bubbles.map((b) =>
        !b.popped && (
          <TouchableWithoutFeedback key={b.id} onPress={() => handlePress(b.id)}>
            <Animated.View
              style={[
                styles.bubble,
                {
                  left: b.x,
                  top: b.y,
                  transform: [{ translateY: b.floatAnim }, { scale: b.scale }],
                },
              ]}
            >
              <Text style={styles.word}>{b.word}</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        ),
      )}
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.primaryColor,
    alignItems: 'center',
    justifyContent: 'top',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    color: themeVariables.whiteColor
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: themeVariables.whiteColor
  },
  bubble: {
    position: 'absolute',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: themeVariables.tertiaryColor,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
  },
  word: {
    color: themeVariables.whiteColor,
    fontWeight: 'bold',
    fontSize: 18,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
  remaining: {
    position: 'absolute',
    top: 96,
    right: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
    zIndex: 1,
  },
});

export default BubblePopOrderGame;
