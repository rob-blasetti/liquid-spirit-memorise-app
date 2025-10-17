import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

// Show two target words in silhouette, then let the player select them from a list.

const SilhouetteSearchGame = ({ quote, onBack, onWin, onLose }) => {
  const text = typeof quote === 'string' ? quote : quote?.text || '';
  const words = text.split(/\s+/).slice(0, 4);
  const [targets, setTargets] = useState([]);
  const [found, setFound] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [message, setMessage] = useState('');
  const hasWonRef = useRef(false);
  const mistakesRef = useRef(0);

  useEffect(() => {
    // choose two target words
    const indices = [0, 1];
    setTargets(indices.map((i) => ({ word: words[i], id: i })));
    setFound([]);
    setShowPreview(true);
    setMessage('');
    hasWonRef.current = false;
    mistakesRef.current = 0;
    const timer = setTimeout(() => setShowPreview(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePress = (id) => {
    if (showPreview) return;
    if (targets.find((t) => t.id === id) && !found.includes(id)) {
      const newFound = [...found, id];
      setFound(newFound);
      if (newFound.length === targets.length) {
        setMessage('Great job!');
        if (!hasWonRef.current) {
          hasWonRef.current = true;
          onWin?.({ perfect: mistakesRef.current === 0 });
        }
      }
    } else {
      setMessage('Try again');
      mistakesRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} variant="whiteShadow" />
      <Text style={styles.title}>Silhouette Search</Text>
      <Text style={styles.description}>Tap the words that match the targets.</Text>
      <View style={styles.row}>
        {targets.map((t) => (
          <View key={t.id} style={styles.targetBox}>
            <Text style={styles.targetWord}>{t.word}</Text>
          </View>
        ))}
      </View>
      {!showPreview && (
        <View style={styles.row}>
          {words.map((w, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionBox}
              onPress={() => handlePress(i)}
            >
              <Text style={styles.optionWord}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    marginVertical: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  targetBox: {
    padding: 12,
    margin: 8,
    backgroundColor: '#000',
  },
  targetWord: {
    color: '#fff',
    fontSize: 18,
  },
  optionBox: {
    padding: 12,
    margin: 8,
    backgroundColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
  },
  optionWord: {
    color: themeVariables.primaryColorDark,
    fontSize: 18,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 12,
  },
});

export default SilhouetteSearchGame;
