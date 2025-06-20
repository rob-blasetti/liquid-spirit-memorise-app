import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const QuotePracticeScreen = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  const cleanWord = (w) => w.replace(/[.,!?;:]/g, '').toLowerCase();

  const checkAnswer = () => {
    if (cleanWord(input) === cleanWord(words[index])) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setInput('');
      setMessage('');
    } else {
      setMessage('Try again');
    }
  };

  const displayedQuote = words
    .map((w, i) => {
      // split word into base and trailing punctuation
      const base = w.replace(/[.,!?;:]+$/, '');
      const punctMatch = w.match(/([.,!?;:]+)$/);
      const punct = punctMatch ? punctMatch[1] : '';
      if (i < index) {
        return w;
      } else if (i === index) {
        // reveal a hint: first third of the word (at least one letter)
        const hintLength = Math.max(1, Math.floor(base.length / 3));
        const hint = base.substring(0, hintLength);
        const blanks = '_'.repeat(base.length - hintLength);
        return hint + blanks + punct;
      } else {
        // upcoming words: full blanks
        const blanks = '_'.repeat(base.length);
        return blanks + punct;
      }
    })
    .join(' ');
  // Provide a static snippet of the beginning of the quote as a hint
  const snippetWordCount = Math.min(3, words.length);
  const snippet = words.slice(0, snippetWordCount).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Quote</Text>
      {/* Hint snippet to jog memory */}
      <Text style={styles.hint}>Hint: {snippet}...</Text>
      <Text style={styles.quote}>{displayedQuote}</Text>
      {index < words.length ? (
        <>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Next word"
          />
          <ThemedButton title="Submit" onPress={checkAnswer} />
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      ) : (
        <Text style={styles.message}>Great job! You finished.</Text>
      )}
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
  hint: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    marginVertical: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    width: '80%',
  },
  message: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
    width: '80%',
  },
});

export default QuotePracticeScreen;
