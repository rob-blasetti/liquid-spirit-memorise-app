import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemedButton from '../../../ui/components/ThemedButton';
import { grade1Lessons } from '../../../utils/data/core/grade1';
import themeVariables from '../../../ui/stylesheets/theme';
import { useProfile } from '../../../hooks/useProfile';
import PrayerBlock from '../../../ui/components/PrayerBlock';
import QuoteBlock from '../../../ui/components/QuoteBlock';
import TopNav from '../../../ui/components/TopNav';

const Grade1LessonScreen = ({ lessonNumber, onBack, onComplete }) => {
  const { profile } = useProfile();
  const lesson = grade1Lessons.find(l => l.lesson === lessonNumber);

  const renderHeader = () => (
    <TopNav
      title="Grade 1"
      onBack={onBack}
      containerStyle={styles.header}
      backAccessibilityLabel="Back to library"
    />
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
          <ThemedButton
            title="Mark Lesson Complete"
            onPress={() => onComplete?.(lesson)}
            style={styles.primaryButton}
          />
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
    paddingHorizontal: 0,
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
  primaryButton: {
    marginBottom: 12,
  },
});

export default Grade1LessonScreen;
