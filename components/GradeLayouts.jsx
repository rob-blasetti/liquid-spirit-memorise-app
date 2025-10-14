import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ButtonList from './ButtonList';
import ThemedButton from './ThemedButton';
import QuoteBlock from './QuoteBlock';
import PrayerBlock from './PrayerBlock';
import { useProfile } from '../hooks/useProfile';
import themeVariables from '../styles/theme';

const ScreenHeader = ({ title, onBack, accessibilityLabel = 'Back to library' }) => (
  <View style={headerStyles.container}>
    {typeof onBack === 'function' ? (
      <TouchableOpacity
        style={headerStyles.button}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="chevron-back" size={22} color={themeVariables.whiteColor} />
      </TouchableOpacity>
    ) : (
      <View style={headerStyles.spacer} />
    )}
    <Text style={headerStyles.title} numberOfLines={1}>
      {title}
    </Text>
    <View style={headerStyles.spacer} />
  </View>
);

export const GradeSetLanding = ({ title, sets = [], onSetSelect, onBack }) => (
  <View style={baseStyles.container}>
    <ScreenHeader title={title} onBack={onBack} />
    <View style={baseStyles.section}>
      <ButtonList
        buttons={sets.map(setNumber => ({
          title: `Set ${setNumber}`,
          onPress: () => onSetSelect(setNumber),
        }))}
      />
    </View>
  </View>
);

export const GradeLessonSelector = ({
  title,
  lessonNumbers = [],
  onLessonSelect,
  onBack,
}) => (
  <View style={baseStyles.container}>
    <ScreenHeader title={title} onBack={onBack} />
    <Text style={baseStyles.helperText}>Choose a lesson to continue</Text>
    <ButtonList
      containerStyle={selectorStyles.buttonList}
      buttons={lessonNumbers.map(number => ({
        title: `Lesson ${number}`,
        onPress: () => onLessonSelect(number),
      }))}
    />
  </View>
);

export const GradeComingSoon = ({ title, message, onBack }) => (
  <View style={baseStyles.container}>
    <ScreenHeader title={title} onBack={onBack} />
    <Text style={comingSoonStyles.subtitle}>{message}</Text>
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
      <ScreenHeader title={gradeTitle} onBack={onBack} />
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
        <ThemedButton title="Back to Library" onPress={onBack} />
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16,
  },
  section: {
    marginTop: 24,
    alignItems: 'center',
  },
  helperText: {
    marginTop: 16,
    textAlign: 'center',
    color: themeVariables.greyColor,
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
    marginTop: 32,
    color: themeVariables.greyColor,
    textAlign: 'center',
  },
});

const lessonStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginVertical: 16,
    textAlign: 'center',
    color: themeVariables.whiteColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
    alignSelf: 'center',
  },
});

const headerStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  spacer: {
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: themeVariables.whiteColor,
    marginHorizontal: 8,
  },
});

export default {
  GradeSetLanding,
  GradeLessonSelector,
  GradeComingSoon,
  GradeLessonContent,
};
