import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ThemedButton from '../components/ThemedButton';
import { grade1Lessons } from '../data/grade1';
import themeVariables from '../styles/theme';
import { useProfile } from '../hooks/useProfile';
import PrayerBlock from '../components/PrayerBlock';
import QuoteBlock from '../components/QuoteBlock';

const Grade1LessonScreen = ({ lessonNumber, onBack }) => {
  const { profile } = useProfile();
  const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);

  const renderHeader = () => (
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
      <Text style={styles.headerTitle}>Grade 1</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (!lesson) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.content}>
          <Text style={styles.lessonTitle}>Lesson Not Found</Text>
          <View style={styles.buttonContainer}>
            <ThemedButton title="Back to Library" onPress={onBack} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        <Text style={styles.lessonTitle}>
          Lesson {lesson.lesson} - {lesson.virtue}
        </Text>
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
          <ThemedButton title="Back to Library" onPress={onBack} />
        </View>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: themeVariables.whiteColor,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  lessonTitle: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 24,
  },
});

export default Grade1LessonScreen;
