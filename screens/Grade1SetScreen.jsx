import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import themeVariables from '../styles/theme';
import { grade1Lessons } from '../data/grade1';
import TopNav from '../components/TopNav';

const Grade1SetScreen = ({ onLessonSelect, onBack }) => {
  return (
    <View style={styles.container}>
      <TopNav title="Grade 1" onBack={onBack} containerStyle={styles.header} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
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
});

export default Grade1SetScreen;
