import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../components/ThemedButton';
import { grade1Lessons } from '../data/grade1';
import themeVariables from '../styles/theme';

import { useProfile } from '../hooks/useProfile';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';

const Grade1LessonScreen = ({ lessonNumber, onBack }) => {
  const { profile } = useProfile();
  const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);
  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lesson Not Found</Text>
        <View style={styles.buttonContainer}>
          <ThemedButton title="Back" onPress={onBack} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson {lesson.lesson} - {lesson.virtue}</Text>
      {lesson.prayer ? (
        <PrayerBlock
          prayer={lesson.prayer}
          profile={profile}
          backgroundColor={themeVariables.neutralLight}
        />
      ) : null}
      {lesson.quote ? (
        <QuoteBlock
          quote={lesson.quote}
          profile={profile}
        />
      ) : null}
      <View style={styles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: themeVariables.whiteColor,
  },
  prayer: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: themeVariables.whiteColor,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    borderColor: themeVariables.whiteColor,
    borderWidth: 1,
    borderRadius: 20
  },
});

export default Grade1LessonScreen;