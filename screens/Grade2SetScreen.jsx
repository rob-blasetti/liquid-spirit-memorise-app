import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import themeVariables from '../styles/theme';

const Grade2SetScreen = ({ setNumber, onLessonSelect, onBack }) => {
  // For Book 3-2, content is coming soon
  if (setNumber === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Grade 2 - Book 3-2</Text>
        <Text style={styles.subtitle}>Content coming soon</Text>
        <View style={styles.buttonContainer}>
          <Button title="Back" onPress={onBack} />
        </View>
      </View>
    );
  }
  // Otherwise, show lessons
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 2 - Set {setNumber}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Lesson 1" onPress={() => onLessonSelect(1)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Lesson 2" onPress={() => onLessonSelect(2)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Lesson 3" onPress={() => onLessonSelect(3)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={onBack} />
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
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
});

export default Grade2SetScreen;