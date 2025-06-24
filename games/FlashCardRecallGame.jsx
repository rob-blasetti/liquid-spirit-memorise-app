import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const FlashCardRecallGame = ({ quote, onBack }) => {
  const [showQuote, setShowQuote] = useState(true);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  // number of hints used (max 3)
  const [hintCount, setHintCount] = useState(0);

  useEffect(() => {
    setShowQuote(true);
    setInput('');
    setMessage('');
    // reset hint count when a new quote is loaded
    setHintCount(0);
    const timer = setTimeout(() => setShowQuote(false), 6000);
    return () => clearTimeout(timer);
  }, [quote]);

  const checkAnswer = () => {
    if (input.trim().toLowerCase() === quote.trim().toLowerCase()) {
      setMessage('Great job!');
    } else {
      setMessage('Try again');
    }
  };
  // reveal next word in the input as a hint, up to 3 times
  const handleHint = () => {
    if (hintCount < 3) {
      const newCount = hintCount + 1;
      setHintCount(newCount);
      // put next words into input field
      const wordsArr = quote.split(' ');
      const newInput = wordsArr.slice(0, newCount).join(' ');
      setInput(newInput);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerIcon}>
          <FontAwesomeIcon icon={faChevronLeft} size={24} color={themeVariables.primaryColor} />
        </TouchableOpacity>
        <Text style={styles.title}>Flash Card Recall</Text>
      </View>
      <Text style={styles.description}>Look at the quote, then write it from memory.</Text>
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
          {/* Hint button and counter */}
          <View style={styles.hintContainer}>
            <ThemedButton
              title="Hint"
              onPress={handleHint}
              disabled={hintCount >= 3}
            />
            <Text style={styles.hintCount}>Hints used: {hintCount}/3</Text>
          </View>
        </>
      )}
      {/* back handled via header icon */}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    width: '80%',
    fontSize: 18,
  },
  message: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginVertical: 8,
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  hintCount: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  hintText: {
    fontSize: 18,
    color: themeVariables.primaryColor,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 12,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default FlashCardRecallGame;
