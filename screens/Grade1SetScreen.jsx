import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../styles/theme';
import { grade1Lessons } from '../data/grade1';

const Grade1SetScreen = ({ onLessonSelect, onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {typeof onBack === 'function' ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to library"
          >
            <Ionicons name="chevron-back" size={22} color={themeVariables.whiteColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Text style={styles.title}>Grade 1</Text>
        <View style={styles.headerSpacer} />
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: themeVariables.whiteColor,
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
