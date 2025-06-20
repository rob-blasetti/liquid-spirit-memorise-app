import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';

const GradesScreen = ({ onGradeSelect }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select Grade</Text>
    <View style={styles.buttonContainer}>
      <ThemedButton title="Grade 1" onPress={() => onGradeSelect(1)} />
    </View>
    <View style={styles.buttonContainer}>
      <ThemedButton title="Grade 2" onPress={() => onGradeSelect(2)} />
    </View>
    <View style={styles.buttonContainer}>
      <ThemedButton title="Grade 3" onPress={() => onGradeSelect(3)} />
    </View>
    <View style={styles.buttonContainer}>
      <ThemedButton title="Grade 4" onPress={() => onGradeSelect(4)} />
    </View>
  </View>
);

export default GradesScreen;

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
    marginVertical: 8,
  },
});