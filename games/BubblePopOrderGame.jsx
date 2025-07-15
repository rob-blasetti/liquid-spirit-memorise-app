import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const { width, height } = Dimensions.get('window');

const createBubble = (word, index) => {
  const startX = Math.random() * (width - 80) + 40;
  const startY = Math.random() * (height / 2) + height / 4;
  const position = new Animated.ValueXY({ x: startX, y: startY });
  const scale = new Animated.Value(1);
  return { word, index, position, scale };
};

const animateBubble = (bubble) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(bubble.position, {
        toValue: { x: bubble.position.x._value + (Math.random() * 40 - 20), y: bubble.position.y._value + (Math.random() * 30 - 15) },
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(bubble.position, {
        toValue: { x: bubble.position.x._value, y: bubble.position.y._value },
        duration: 3000,
        useNativeDriver: true,
      }),
    ]),
  ).start();
};

const BubblePopOrderGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/).slice(0, 6);
  const [bubbles, setBubbles] = useState(words.map(createBubble));
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('');

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      bubbles.forEach(animateBubble);
      initialized.current = true;
    }
  }, [bubbles]);

  const handlePress = (idx) => {
    const bubble = bubbles[idx];
    if (!bubble) return;
    if (bubble.word === words[current]) {
      Animated.timing(bubble.scale, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setBubbles((prev) => prev.map((b) => (b.index === idx ? { ...b, popped: true } : b)));
        const next = current + 1;
        setCurrent(next);
        if (next === words.length) setMessage('Great job!');
      });
    } else {
      Animated.sequence([
        Animated.timing(bubble.scale, { toValue: 0.5, duration: 200, useNativeDriver: true }),
        Animated.timing(bubble.scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Bubble Pop Order</Text>
      <Text style={styles.description}>Pop the words in order.</Text>
      {bubbles.map((bubble, idx) =>
        !bubble.popped && (
          <Animated.View
            key={idx}
            style={[
              styles.bubble,
              {
                transform: [
                  { translateX: bubble.position.x },
                  { translateY: bubble.position.y },
                  { scale: bubble.scale },
                ],
              },
            ]}
          >
            <TouchableWithoutFeedback onPress={() => handlePress(idx)}>
              <View style={styles.bubbleInner}>
                <Text style={styles.word}>{bubble.word}</Text>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        ),
      )}
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeVariables.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    top: 60,
    fontSize: 28,
    textAlign: 'center',
  },
  description: {
    position: 'absolute',
    top: 100,
    fontSize: 16,
    textAlign: 'center',
  },
  bubble: {
    position: 'absolute',
  },
  bubbleInner: {
    backgroundColor: themeVariables.primaryColorLight,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
  },
  word: {
    color: themeVariables.primaryColor,
    fontSize: 16,
  },
  message: {
    position: 'absolute',
    bottom: 60,
    fontSize: 20,
    color: themeVariables.primaryColor,
  },
});

export default BubblePopOrderGame;
