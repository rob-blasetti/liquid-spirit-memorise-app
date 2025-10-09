import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from './ButtonList';
import ThemedButton from './ThemedButton';
import QuoteBlock from './QuoteBlock';
import PrayerBlock from './PrayerBlock';
import { useProfile } from '../hooks/useProfile';
import themeVariables from '../styles/theme';

export const GradeSetLanding = ({ title, sets = [], onSetSelect, onBack }) => (
  <View style={baseStyles.container}>
    <Text style={baseStyles.title}>{title}</Text>
    <ButtonList
      buttons={[
        ...sets.map(setNumber => ({
          title: `Set ${setNumber}`,
          onPress: () => onSetSelect(setNumber),
        })),
        { title: 'Back', onPress: onBack },
      ]}
    />
  </View>
);

export const GradeLessonSelector = ({
  title,
  lessonNumbers = [],
  onLessonSelect,
  onBack,
}) => (
  <View style={baseStyles.container}>
    <Text style={baseStyles.title}>{title}</Text>
    <ButtonList
      containerStyle={selectorStyles.buttonList}
      buttons={[
        ...lessonNumbers.map(number => ({
          title: `Lesson ${number}`,
          onPress: () => onLessonSelect(number),
        })),
        { title: 'Back', onPress: onBack },
      ]}
    />
  </View>
);

export const GradeComingSoon = ({ title, message, onBack }) => (
  <View style={baseStyles.container}>
    <Text style={baseStyles.title}>{title}</Text>
    <Text style={comingSoonStyles.subtitle}>{message}</Text>
    <ButtonList buttons={[{ title: 'Back', onPress: onBack }]} />
  </View>
);

export const GradeLessonContent = ({
  gradeTitle,
  setNumber,
  lessonNumber,
  getLessonContent,
  fallbackQuote,
  onBack,
  onComplete,
  onPractice,
  onPlayGame,
}) => {
  const { profile } = useProfile();
  const lessonContent =
    typeof getLessonContent === 'function'
      ? getLessonContent(setNumber, lessonNumber)
      : {};
  const quote =
    (lessonContent && lessonContent.text) ||
    (typeof fallbackQuote === 'function'
      ? fallbackQuote(setNumber, lessonNumber)
      : '');

  return (
    <View style={lessonStyles.container}>
      <Text style={lessonStyles.title}>
        {gradeTitle} - Set {setNumber} Lesson {lessonNumber}
      </Text>
      {lessonContent?.prayer ? (
        <PrayerBlock prayer={lessonContent.prayer} profile={profile} />
      ) : null}
      {quote ? (
        <QuoteBlock
          quote={quote}
          profile={profile}
          references={lessonContent?.references}
        />
      ) : null}
      <View style={lessonStyles.buttonContainer}>
        <ThemedButton
          title="Complete Lesson"
          onPress={() => onComplete?.(setNumber, lessonNumber)}
        />
        <ThemedButton
          title="Practice"
          onPress={() => onPractice?.(lessonContent)}
        />
        <ThemedButton
          title="Play Game"
          onPress={() => onPlayGame?.(lessonContent)}
        />
      </View>
      <View style={lessonStyles.buttonContainer}>
        <ThemedButton title="Back" onPress={onBack} />
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: themeVariables.whiteColor,
  },
});

const selectorStyles = StyleSheet.create({
  buttonList: {
    marginVertical: 8,
  },
});

const comingSoonStyles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: themeVariables.greyColor,
    textAlign: 'center',
  },
});

const lessonStyles = StyleSheet.create({
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
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
  },
});

export default {
  GradeSetLanding,
  GradeLessonSelector,
  GradeComingSoon,
  GradeLessonContent,
};

