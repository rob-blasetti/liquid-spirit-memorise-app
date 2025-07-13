import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import themeVariables from '../styles/theme';

const Grade2bSetScreen = ({ setNumber, onLessonSelect, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Grade 2 - Set {setNumber}</Text>
    {[1,2,3].map(lesson => (
      <View key={lesson} style={styles.buttonContainer}>
        <ThemedButton title={`Lesson ${lesson}`} onPress={() => onLessonSelect(lesson)} />
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
    marginBottom: 24,
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 8,
  },
});

export default Grade2bSetScreen;
