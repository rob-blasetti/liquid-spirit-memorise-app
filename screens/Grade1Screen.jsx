import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { prayers, grade1Lessons } from '../data/grade1';

const Grade1Screen = ({ onBack }) => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Grade 1</Text>
    {grade1Lessons.map(l => (
      <View key={l.lesson} style={styles.lessonContainer}>
        <Text style={styles.lessonTitle}>
          Lesson {l.lesson} - {l.virtue}
        </Text>
        <Text style={styles.prayer}>{l.prayer}</Text>
        <Text style={styles.quote}>{l.quote}</Text>
      </View>
    ))}
    <View style={styles.buttonContainer}>
      <ThemedButton title="Back" onPress={onBack} />
    </View>
  </ScrollView>
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
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  lessonContainer: {
    marginBottom: 24,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  prayer: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default Grade1Screen;
