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
    .map((w, i) => (i < index ? w : '_____'))
    .join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Quote</Text>
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
