import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const FastTypeGame = ({ quote, onBack }) => {
  const [time, setTime] = useState(15);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTime(15);
    setInput('');
    setMessage('');
    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quote]);

  useEffect(() => {
    if (time === 0 && message === '') {
      check();
    }
  }, [time]);

  const check = () => {
    if (input.trim().toLowerCase() === quote.trim().toLowerCase()) {
      setMessage('Great job!');
    } else {
      setMessage("Time's up!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Type It Fast</Text>
      <Text style={styles.timer}>Time: {time}</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type the quote"
        multiline
      />
      <ThemedButton title="Submit" onPress={check} />
      {message !== '' && <Text style={styles.message}>{message}</Text>}
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
    backgroundColor: themeVariables.neutralLight,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  timer: {
    fontSize: 18,
    marginBottom: 8,
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
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default FastTypeGame;
