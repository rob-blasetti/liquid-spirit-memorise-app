import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { quoteMap } from '../data/grade2b';

const Grade2bLessonScreen = ({ setNumber, lessonNumber, onBack, onPractice, onComplete, onPlayGame }) => {
  const quoteObj = quoteMap[`${setNumber}-${lessonNumber}`];
  const quote = quoteObj?.text || `This is a dummy quote for Lesson ${lessonNumber} of Set ${setNumber}.`;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 2 - Set {setNumber} Lesson {lessonNumber}</Text>
      <Text style={styles.quote}>{quote}</Text>
      <View style={styles.buttonContainer}>
        <ThemedButton title="Complete Lesson" onPress={() => onComplete(setNumber, lessonNumber)} />
        <ThemedButton title="Practice" onPress={() => onPractice(quoteObj)} />
        <ThemedButton title="Play Game" onPress={() => onPlayGame(quoteObj)} />
      </View>
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
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade2bLessonScreen;
