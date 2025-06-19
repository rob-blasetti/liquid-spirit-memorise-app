import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import themeVariables from '../styles/theme';
import { grade1Lessons } from './Grade1Screen';

const Grade1SetScreen = ({ onLessonSelect, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grade 1</Text>
      <View style={styles.grid}>
        {grade1Lessons.map(lesson => (
          <TouchableOpacity
            key={lesson.lesson}
            style={styles.gridItem}
            onPress={() => onLessonSelect(lesson.lesson)}
          >
            <Text style={styles.gridItemText}>Lesson {lesson.lesson}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridItem: {
    width: '30%',
    margin: '1.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: themeVariables.whiteColor,
  },
  gridItemText: {
    fontSize: 16,
    textAlign: 'center',
    color: themeVariables.primaryColor,
  },
  buttonContainer: {
    marginTop: 24,
    width: '80%',
  },
  backButton: {
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 12,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
  },
  backButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
});

export default Grade1SetScreen;