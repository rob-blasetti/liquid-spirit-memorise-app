import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ButtonList from './ButtonList';
import QuoteBlock from './QuoteBlock';
import PrayerBlock from './PrayerBlock';
import themeVariables from '../stylesheets/theme';
import TopNav from './TopNav';
import speechService from '../../services/speechService';

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
  profile,
  setNumber,
  lessonNumber,
  showSetInTitle = true,
  getLessonContent,
  fallbackQuote,
  onBack,
  hasPreviousLesson = false,
  hasNextLesson = false,
  onGoPreviousLesson,
  onGoNextLesson,
  onPractice,
  onPlayGame,
}) => {
  const [activeAudioKey, setActiveAudioKey] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cancelRef = useRef(false);
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
  const lessonKey = `${gradeTitle}|${setNumber ?? 'none'}|${lessonNumber ?? 'none'}`;

  useEffect(() => {
    const onFinish = () => {
      cancelRef.current = true;
      setIsSpeaking(false);
      setActiveAudioKey(null);
    };
    speechService.setupTTSListeners(onFinish);
    return () => {
      cancelRef.current = true;
      speechService.hardStop();
      speechService.cleanupTTSListeners();
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking) return;
    cancelRef.current = true;
    speechService.hardStop();
    setIsSpeaking(false);
    setActiveAudioKey(null);
  }, [lessonKey, isSpeaking]);

  const handleAudioPress = useCallback(
    async (audioKey, text) => {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return;
      }
      try {
        if (isSpeaking && activeAudioKey === audioKey) {
          cancelRef.current = true;
          await speechService.hardStop();
          setIsSpeaking(false);
          setActiveAudioKey(null);
          return;
        }
        cancelRef.current = true;
        await speechService.hardStop();
        cancelRef.current = false;
        setActiveAudioKey(audioKey);
        setIsSpeaking(true);
        speechService.readQuote(text, profile, cancelRef);
      } catch (error) {
        console.warn('Lesson audio failed:', error);
        setIsSpeaking(false);
        setActiveAudioKey(null);
      }
    },
    [activeAudioKey, isSpeaking, profile],
  );

  const renderSectionHeader = useCallback(
    (title, audioKey, text) => {
      const hasAudio = typeof text === 'string' && text.trim().length > 0;
      const isActive = isSpeaking && activeAudioKey === audioKey;
      return (
        <View style={lessonStyles.sectionHeader}>
          <Text style={lessonStyles.sectionTitle}>{title}</Text>
          {hasAudio ? (
            <TouchableOpacity
              style={[
                lessonStyles.audioButton,
                isActive && lessonStyles.audioButtonActive,
              ]}
              onPress={() => handleAudioPress(audioKey, text)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isActive ? `Stop ${title.toLowerCase()} audio` : `Play ${title.toLowerCase()} audio`}
            >
              <Ionicons
                name={isActive ? 'stop-circle-outline' : 'play-circle-outline'}
                size={22}
                color={themeVariables.whiteColor}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      );
    },
    [activeAudioKey, handleAudioPress, isSpeaking],
  );

  return (
    <ScrollView
      style={lessonStyles.container}
      contentContainerStyle={lessonStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TopNav
        onBack={onBack}
        containerStyle={headerStyles.container}
        backAccessibilityLabel="Back to library"
      >
        <View style={lessonStyles.headerTitleWrap}>
          <Text style={lessonStyles.headerGradeTitle}>{gradeTitle}</Text>
          <Text style={lessonStyles.headerLessonTitle}>
            {showSetInTitle
              ? `Set ${setNumber} Lesson ${lessonNumber}`
              : `Lesson ${lessonNumber}`}
          </Text>
        </View>
      </TopNav>
      <View style={lessonStyles.paginationRow}>
        <TouchableOpacity
          style={[
            lessonStyles.paginationButton,
            !hasPreviousLesson && lessonStyles.paginationButtonDisabled,
          ]}
          onPress={onGoPreviousLesson}
          disabled={!hasPreviousLesson}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Go to previous lesson"
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={themeVariables.whiteColor}
          />
          <Text style={lessonStyles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            lessonStyles.paginationButton,
            !hasNextLesson && lessonStyles.paginationButtonDisabled,
          ]}
          onPress={onGoNextLesson}
          disabled={!hasNextLesson}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Go to next lesson"
        >
          <Text style={lessonStyles.paginationButtonText}>Next</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={themeVariables.whiteColor}
          />
        </TouchableOpacity>
      </View>
      {lessonContent?.prayer ? (
        <>
          {renderSectionHeader('Prayer', 'prayer', lessonContent.prayer)}
          <PrayerBlock prayer={lessonContent.prayer} profile={profile} />
        </>
      ) : null}
      {quote ? (
        <>
          {renderSectionHeader('Quote', 'quote', quote)}
          <QuoteBlock
            quote={quote}
            profile={profile}
            references={lessonContent?.references}
          />
        </>
      ) : null}
      <View style={lessonStyles.buttonRow}>
        <View style={lessonStyles.inlineButtonWrap}>
          <TouchableOpacity
            style={lessonStyles.practiceButton}
            onPress={() => onPractice?.(completionPayload.text || completionPayload.quote || quote)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open practice"
          >
            <Text style={lessonStyles.practiceButtonText}>Practice</Text>
            <Ionicons
              name="create-outline"
              size={18}
              color={themeVariables.whiteColor}
            />
          </TouchableOpacity>
        </View>
        <View style={lessonStyles.inlineButtonWrap}>
          <TouchableOpacity
            style={lessonStyles.playGameButton}
            onPress={() => onPlayGame?.(completionPayload.text || completionPayload.quote || quote)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Play game"
          >
            <Text style={lessonStyles.playGameButtonText}>Play Game</Text>
            <Ionicons
              name="game-controller-outline"
              size={18}
              color={themeVariables.whiteColor}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
  contentContainer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16,
    paddingBottom: 32,
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
    alignSelf: 'stretch',
  },
  contentContainer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 16,
    paddingBottom: 32,
  },
  headerTitleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  headerGradeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: themeVariables.whiteColor,
    opacity: 0.82,
    textAlign: 'center',
  },
  headerLessonTitle: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: '700',
    color: themeVariables.whiteColor,
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: themeVariables.borderRadiusPill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  paginationButtonDisabled: {
    opacity: 0.35,
  },
  paginationButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  audioButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  audioButtonActive: {
    backgroundColor: themeVariables.primaryColor,
    borderColor: themeVariables.primaryColor,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 16,
    alignSelf: 'center',
  },
  buttonRow: {
    marginTop: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  inlineButtonWrap: {
    alignItems: 'center',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  practiceButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
  },
  playGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: themeVariables.primaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  playGameButtonText: {
    color: themeVariables.whiteColor,
    fontSize: 16,
    fontWeight: '600',
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
