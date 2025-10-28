import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import themeVariables from '../../../ui/stylesheets/theme';

const LessonJourneyScreen = ({ profile, currentProgress, completedLessons, onBack, goToLesson }) => {
  const grade = profile?.grade;
  const { setNumber, lessonNumber } = currentProgress || {};

  const renderGrade1 = () => {
    const lessons = Array.from({ length: lessonNumber || 0 }, (_, i) => i + 1);
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lessons</Text>
        <View style={styles.lessonList}>
          {lessons.map(l => (
            <TouchableOpacity key={l} style={styles.lessonButton} onPress={() => goToLesson(null, l)}>
              <Text style={styles.lessonText}>Lesson {l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderGrade2 = () => {
    const currentSet = setNumber || 1;
    const startSet = Math.max(1, currentSet - 1);
    const sets = [];
    for (let s = startSet; s <= currentSet; s++) {
      const lessons = [1, 2, 3];
      sets.push(
        <View key={s} style={styles.section}>
          <Text style={styles.sectionTitle}>Set {s}</Text>
          <View style={styles.lessonRow}>
            {lessons.map(l => {
              const completed = completedLessons[s]?.[l];
              const isCurrent = s === currentSet && l === lessonNumber;
              return (
                <TouchableOpacity
                  key={l}
                  style={[styles.lessonCircle, completed && styles.completed, isCurrent && styles.current]}
                  onPress={() => goToLesson(s, l)}
                >
                  <Text style={styles.lessonText}>{l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }
    return sets;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Journey</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {grade === 1 && renderGrade1()}
        {grade === 2 && renderGrade2()}
        {grade === '2b' && renderGrade2()}
      </ScrollView>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: themeVariables.primaryColor,
  },
  title: {
    fontSize: 24,
    color: themeVariables.whiteColor,
    marginBottom: 16,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: themeVariables.whiteColor,
    marginBottom: 12,
  },
  lessonList: {
    width: '100%',
    alignItems: 'center',
  },
  lessonButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: themeVariables.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
  completed: {
    backgroundColor: themeVariables.secondaryColor,
  },
  current: {
    borderColor: themeVariables.tertiaryColor,
    borderWidth: 2,
  },
  backButton: {
    marginTop: 'auto',
    width: '80%',
    backgroundColor: themeVariables.primaryLightColor,
    paddingVertical: 12,
    borderRadius: themeVariables.borderRadiusPill,
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
  },
});

export default LessonJourneyScreen;

