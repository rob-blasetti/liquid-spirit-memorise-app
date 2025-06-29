import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import GameTopBar from '../components/GameTopBar';
import themeVariables from '../styles/theme';

const RevealWordGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);

  const revealNext = () => {
    if (index < words.length) {
      const nextIndex = Math.min(index + 2, words.length);
      setIndex(nextIndex);
    }
  };

  const displayed = words
    .map((w, i) => (i < index ? w : '_'.repeat(w.length)))
    .join(' ');

  return (
    <View style={styles.container}>
      <GameTopBar onBack={onBack} />
      <Text style={styles.title}>Reveal the Quote</Text>
      <Text style={styles.description}>Press the button to show more words.</Text>
      <Text style={styles.quote}>{displayed}</Text>
      {index < words.length && (
        <ThemedButton title="Reveal Word" onPress={revealNext} />
      )}
      {index === words.length && <Text style={styles.message}>All done!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: themeVariables.neutralLight,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 20,
    marginVertical: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default RevealWordGame;
