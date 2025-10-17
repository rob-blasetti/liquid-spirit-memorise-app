import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

// Use the first three words of the quote as the rhythm elements.
const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const RhythmRepeatGame = ({ quote, onBack, onWin, onLose }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/).slice(0, 3);
  const [sequence, setSequence] = useState([]); // playback order
  const [playIndex, setPlayIndex] = useState(0);
  const [userIndex, setUserIndex] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);

  useEffect(() => {
    startRound();
    hasWonRef.current = false;
    mistakesRef.current = 0;
  }, []);

  const startRound = () => {
    // shuffle order of the words for playback
    const seq = shuffle([0, 1, 2]);
    setSequence(seq);
    setPlayIndex(0);
    setUserIndex(0);
    setMessage('');
  };

  useEffect(() => {
    if (playIndex < sequence.length) {
      const idx = sequence[playIndex];
      setTimeout(() => {
        setHighlight(idx);
        setTimeout(() => {
          setHighlight(null);
          setPlayIndex((p) => p + 1);
        }, 400);
      }, 600);
    }
  }, [playIndex, sequence]);

  const handlePress = (idx) => {
    if (playIndex < sequence.length || hasWonRef.current) return; // wait for playback
    if (sequence[userIndex] === idx) {
      const next = userIndex + 1;
      setUserIndex(next);
      if (next === sequence.length) {
        setMessage('Great job!');
        if (!hasWonRef.current) {
          hasWonRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
      startRound();
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Rhythm Repeat</Text>
      <Text style={styles.description}>Watch the word rhythm then repeat it.</Text>
      <View style={styles.row}>
        {words.map((w, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.beat, highlight === i && styles.highlight]}
            onPress={() => handlePress(i)}
          >
            <Text style={styles.word}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'transparent',
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
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  beat: {
    width: 70,
    height: 70,
    margin: 8,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
  },
  highlight: {
    backgroundColor: themeVariables.primaryColorLight,
  },
  word: {
    color: themeVariables.primaryColorDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default RhythmRepeatGame;
