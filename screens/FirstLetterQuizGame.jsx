import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const FirstLetterQuizGame = ({ quote, onBack }) => {
  const words = quote.split(/\s+/);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  const check = () => {
    if (input.trim().toLowerCase() === words[index].toLowerCase()) {
      const next = index + 1;
      setIndex(next);
      setInput('');
      setMessage('');
    } else {
      setMessage('Try again');
    }
  };

  const display = words
    .map((w, i) => (i < index ? w : w[0]))
    .join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>First Letter Quiz</Text>
      <Text style={styles.quote}>{display}</Text>
      {index < words.length ? (
        <>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Next word"
          />
          <ThemedButton title="Submit" onPress={check} />
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
      ) : (
        <Text style={styles.message}>Great job!</Text>
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
    fontSize: 16,
    color: '#e52f2f',
    marginVertical: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default FirstLetterQuizGame;
