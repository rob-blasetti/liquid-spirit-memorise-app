import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ButtonList from './ButtonList';
import ThemedButton from './ThemedButton';
import QuoteBlock from './QuoteBlock';
import PrayerBlock from './PrayerBlock';
import { useProfile } from '../../hooks/useProfile';
import themeVariables from '../stylesheets/theme';
import TopNav from './TopNav';

export const GradeSetLanding = ({ title, sets = [], onSetSelect, onBack }) => (
  <View style={baseStyles.container}>
    <TopNav
      title={title}
      onBack={onBack}
      containerStyle={headerStyles.container}
      backAccessibilityLabel="Back to library"
    />
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
    <TopNav
      title={title}
      onBack={onBack}
      containerStyle={headerStyles.container}
      backAccessibilityLabel="Back to library"
    />
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

export const GradeSetLessonSelector = ({
  title,
  sets = [],
  lessonNumbers = [],
  initialSetNumber,
  onLessonSelect,
  onBack,
}) => {
  const resolvedInitialSet =
    sets.includes(initialSetNumber) && initialSetNumber != null
      ? initialSetNumber
      : sets[0];
  const [selectedSet, setSelectedSet] = React.useState(resolvedInitialSet);

  React.useEffect(() => {
    if (sets.length === 0) {
      setSelectedSet(undefined);
      return;
    }
    if (
      initialSetNumber != null &&
      sets.includes(initialSetNumber) &&
      initialSetNumber !== selectedSet
    ) {
      setSelectedSet(initialSetNumber);
      return;
    }
    if (!sets.includes(selectedSet)) {
      setSelectedSet(resolvedInitialSet);
    }
  }, [sets, selectedSet, resolvedInitialSet, initialSetNumber]);

  return (
    <View style={baseStyles.container}>
      <TopNav
        title={title}
        onBack={onBack}
        containerStyle={headerStyles.container}
        backAccessibilityLabel="Back to library"
      />
      <Text style={baseStyles.helperText}>Choose a set</Text>
      <ButtonList
        containerStyle={selectorStyles.buttonList}
        buttons={sets.map(setNumber => ({
          key: `set-${setNumber}`,
          title: `Set ${setNumber}`,
          onPress: () => setSelectedSet(setNumber),
          style: selectedSet === setNumber ? selectorStyles.selectedButton : null,
          textStyle: selectedSet === setNumber ? selectorStyles.selectedButtonText : null,
        }))}
      />
      <Text style={baseStyles.helperText}>
        {selectedSet != null
          ? `Choose a lesson in Set ${selectedSet}`
          : 'Choose a lesson to continue'}
      </Text>
      <ButtonList
        containerStyle={selectorStyles.buttonList}
        buttons={lessonNumbers.map(number => ({
          key: `lesson-${number}`,
          title: `Lesson ${number}`,
          onPress: () => onLessonSelect?.(selectedSet, number),
          disabled: selectedSet == null,
        }))}
      />
    </View>
  );
};

export const GradeComingSoon = ({ title, message, onBack }) => (
  <View style={baseStyles.container}>
    <TopNav
      title={title}
      onBack={onBack}
      containerStyle={headerStyles.container}
      backAccessibilityLabel="Back to library"
    />
    <Text style={comingSoonStyles.subtitle}>{message}</Text>
  </View>
);

export const GradeLessonContent = ({
  gradeTitle,
  grade,
  setNumber,
  lessonNumber,
  showSetInTitle = true,
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
  const completionPayload =
    lessonContent && Object.keys(lessonContent).length > 0
      ? lessonContent
      : { text: quote };

  return (
    <View style={lessonStyles.container}>
      <TopNav
        title={gradeTitle}
        onBack={onBack}
        containerStyle={headerStyles.container}
        backAccessibilityLabel="Back to library"
      />
      <Text style={lessonStyles.title}>
        {showSetInTitle
          ? `${gradeTitle} - Set ${setNumber} Lesson ${lessonNumber}`
          : `${gradeTitle} - Lesson ${lessonNumber}`}
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
          onPress={() => onComplete?.(setNumber, lessonNumber, completionPayload, { grade })}
        />
        <ThemedButton
          title="Practice"
          onPress={() => onPractice?.(completionPayload.text || completionPayload.quote || quote)}
        />
        <ThemedButton
          title="Play Game"
          onPress={() => onPlayGame?.(completionPayload.text || completionPayload.quote || quote)}
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
  selectedButton: {
    backgroundColor: themeVariables.secondaryColor,
  },
  selectedButtonText: {
    color: themeVariables.whiteColor,
    fontWeight: '700',
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
    paddingHorizontal: 0,
    marginBottom: 16,
  },
});

export default {
  GradeSetLanding,
  GradeLessonSelector,
  GradeSetLessonSelector,
  GradeComingSoon,
  GradeLessonContent,
};
