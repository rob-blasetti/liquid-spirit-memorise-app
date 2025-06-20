import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const FlashCardRecallGame = ({ quote, onBack }) => {
  const [showQuote, setShowQuote] = useState(true);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setShowQuote(true);
    setInput('');
    setMessage('');
    const timer = setTimeout(() => setShowQuote(false), 4000);
    return () => clearTimeout(timer);
  }, [quote]);

  const checkAnswer = () => {
    if (input.trim().toLowerCase() === quote.trim().toLowerCase()) {
      setMessage('Great job!');
    } else {
      setMessage('Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flash Card Recall</Text>
      {showQuote ? (
        <Text style={styles.quote}>{quote}</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type the quote"
            multiline
          />
          <ThemedButton title="Submit" onPress={checkAnswer} />
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </>
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

export default FlashCardRecallGame;
