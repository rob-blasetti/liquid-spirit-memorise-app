import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const RevealWordGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);

  const revealNext = () => {
    if (index < words.length) {
      setIndex(index + 1);
    }
  };

  const displayed = words
    .map((w, i) => (i < index ? w : '_'.repeat(w.length)))
    .join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reveal the Quote</Text>
      <Text style={styles.quote}>{displayed}</Text>
      {index < words.length && (
        <ThemedButton title="Reveal Word" onPress={revealNext} />
      )}
      {index === words.length && <Text style={styles.message}>All done!</Text>}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  quote: {
    fontSize: 16,
    marginVertical: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#e52f2f',
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default RevealWordGame;
