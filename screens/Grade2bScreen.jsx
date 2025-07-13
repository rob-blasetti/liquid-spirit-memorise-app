import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const Grade2bScreen = ({ onBack, onSetSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 2 - Book 3-2</Text>
    {[4,5,6,7].map(setNum => (
      <View key={setNum} style={styles.buttonContainer}>
        <ThemedButton title={`Set ${setNum}`} onPress={() => onSetSelect(setNum)} />
      </View>
    ))}
    <View style={styles.buttonContainer}>
      <ThemedButton title="Back" onPress={onBack} />
    </View>
  </View>
);

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
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade2bScreen;
