import React, { useEffect, useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet, Dimensions } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BubblePopOrderGame = ({ quote, onBack }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [bubbles, setBubbles] = useState([]);

  // initialize bubbles
  useEffect(() => {
    const items = words.map((w, i) => {
      const startX = Math.random() * (SCREEN_WIDTH - 80);
      const startY = Math.random() * (SCREEN_HEIGHT / 2) + SCREEN_HEIGHT / 4;
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
      return { word: w, id: i, x: startX, y: startY, floatAnim, scale, popped: false };
    });
    setBubbles(items);
    setIndex(0);
    setMessage('');
  }, [text]);

  const handlePress = (id) => {
    setBubbles((prev) => {
      const updated = prev.map((b) => {
        if (b.id !== id) return b;
        if (b.popped) return b;
        if (b.word === words[index]) {
          Animated.timing(b.scale, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          b.popped = true;
          const next = index + 1;
          setIndex(next);
          if (next === words.length) setMessage('Great job!');
          else setMessage('');
        } else {
          Animated.sequence([
            Animated.timing(b.scale, { toValue: 0.5, duration: 150, useNativeDriver: true }),
            Animated.timing(b.scale, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start();
          setMessage('Try again');
        }
        return b;
      });
      return [...updated];
    });
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
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
    backgroundColor: themeVariables.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  bubble: {
    position: 'absolute',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: themeVariables.primaryLightColor,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
  },
  word: {
    color: themeVariables.primaryColorDark,
    fontWeight: 'bold',
    fontSize: 18,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default BubblePopOrderGame;
