import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Grade2SetScreen = ({ setNumber, onLessonSelect, onBack }) => {
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
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
});

export default Grade2SetScreen;