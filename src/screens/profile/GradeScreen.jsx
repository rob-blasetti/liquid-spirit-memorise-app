import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { grade1Lessons } from '../../utils/data/core/grade1';
import { GRADE_SCREEN_CONFIG } from '../../utils/data/core/gradesConfig';
import {
  GradeLessonContent,
  GradeComingSoon,
} from '../../ui/components/GradeLayouts';
import TopNav from '../../ui/components/TopNav';
import themeVariables from '../../ui/stylesheets/theme';

const GradeSelectionSection = ({
  title,
  helperText,
  helperPosition = 'top',
  helperEmphasis = false,
  iconName,
  values = [],
  selectedValue,
  onSelect,
  disabled = false,
  joined = false,
}) => {
  if (!Array.isArray(values) || values.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {helperText && helperPosition === 'top' ? (
        <Text style={[styles.sectionHelper, helperEmphasis && styles.sectionHelperEmphasis]}>
          {helperText}
        </Text>
      ) : null}
      <View style={[styles.optionGrid, joined && styles.joinedOptionGrid]}>
        {values.map(value => {
          const isSelected = selectedValue === value;
          const isLast = values[values.length - 1] === value;
          return (
            <TouchableOpacity
              key={`${title}-${value}`}
              style={[
                joined ? styles.joinedOptionTile : styles.optionTile,
                !joined && (values.length >= 4 ? styles.optionTileFour : styles.optionTileThree),
                isSelected && styles.optionTileSelected,
                disabled && styles.optionTileDisabled,
                joined && styles.joinedOptionTileShared,
                joined && isLast && styles.joinedOptionTileLast,
                joined && isSelected && styles.joinedOptionTileSelected,
              ]}
              onPress={() => onSelect?.(value)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={`${title} ${value}`}
            >
              <View style={joined ? styles.joinedOptionContent : styles.optionIconRow}>
                {!joined ? (
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={isSelected ? themeVariables.primaryColor : themeVariables.whiteColor}
                  />
                ) : null}
                <Text style={[styles.optionNumber, isSelected && styles.optionNumberSelected]}>
                  {value}
                </Text>
                {!joined ? (
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={isSelected ? themeVariables.primaryColor : themeVariables.whiteColor}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {helperText && helperPosition === 'bottom' ? (
        <Text style={[styles.sectionHelper, helperEmphasis && styles.sectionHelperEmphasis]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const GradeScreen = ({
  grade,
  profile,
  setNumber,
  lessonNumber,
  from,
  onBackToLibrary,
  onBackToJourney,
  onSelectLesson,
  onComplete,
  onPractice,
  onPlayGame,
}) => {
  const gradeKey = String(grade ?? '');
  const backHandler = from === 'journey' ? onBackToJourney : onBackToLibrary;

  const config = useMemo(() => {
    if (gradeKey === '1') {
      const lessonNumbers = grade1Lessons.map(item => Number(item.lesson)).filter(Number.isFinite);
      return {
        grade: 1,
        title: 'Grade 1',
        sets: [],
        lessonNumbers,
        getLessonContent: (_setNo, lessonNo) => {
          const lesson = grade1Lessons.find(entry => Number(entry.lesson) === Number(lessonNo));
          if (!lesson) return {};
          return {
            text: lesson.quote,
            prayer: lesson.prayer,
          };
        },
        fallbackQuote: (_setNo, lessonNo) => `This is a dummy quote for Lesson ${lessonNo}.`,
      };
    }
    if (gradeKey === '2b') return GRADE_SCREEN_CONFIG['2b'];
    if (gradeKey === '2') return GRADE_SCREEN_CONFIG[2];
    if (gradeKey === '3') return GRADE_SCREEN_CONFIG[3];
    if (gradeKey === '4') return GRADE_SCREEN_CONFIG[4];
    return null;
  }, [gradeKey]);

  const availableSets = useMemo(() => (Array.isArray(config?.sets) ? config.sets : []), [config]);
  const availableLessons = useMemo(
    () => (Array.isArray(config?.lessonNumbers) ? config.lessonNumbers : []),
    [config],
  );
  const setTitles = useMemo(
    () => (config?.setTitles && typeof config.setTitles === 'object' ? config.setTitles : {}),
    [config],
  );
  const defaultSet = useMemo(() => (availableSets.length > 0 ? availableSets[0] : null), [availableSets]);
  const normalizedSetNumber = Number(setNumber);
  const normalizedLessonNumber = Number(lessonNumber);
  const effectiveSetNumber = useMemo(() => {
    if (availableSets.length === 0) return null;
    if (Number.isFinite(normalizedSetNumber) && availableSets.includes(normalizedSetNumber)) {
      return normalizedSetNumber;
    }
    return defaultSet;
  }, [availableSets, normalizedSetNumber, defaultSet]);

  const [selectedSet, setSelectedSet] = useState(effectiveSetNumber);

  useEffect(() => {
    if (availableSets.length === 0) {
      setSelectedSet(null);
      return;
    }
    if (Number.isFinite(effectiveSetNumber) && availableSets.includes(effectiveSetNumber)) {
      setSelectedSet(effectiveSetNumber);
      return;
    }
    setSelectedSet(defaultSet);
  }, [availableSets, effectiveSetNumber, defaultSet]);

  const hasSelectedLesson = Number.isFinite(normalizedLessonNumber) && normalizedLessonNumber > 0;
  const hasSets = availableSets.length > 0;
  const lessonTargets = useMemo(() => {
    if (hasSets) {
      return availableSets.flatMap((availableSetNumber) =>
        availableLessons.map((availableLessonNumber) => ({
          setNumber: availableSetNumber,
          lessonNumber: availableLessonNumber,
        })),
      );
    }
    return availableLessons.map((availableLessonNumber) => ({
      setNumber: null,
      lessonNumber: availableLessonNumber,
    }));
  }, [availableLessons, availableSets, hasSets]);
  const currentLessonIndex = useMemo(
    () =>
      lessonTargets.findIndex((target) => (
        target.lessonNumber === normalizedLessonNumber
        && (hasSets ? target.setNumber === effectiveSetNumber : true)
      )),
    [lessonTargets, normalizedLessonNumber, hasSets, effectiveSetNumber],
  );
  const previousLessonTarget = currentLessonIndex > 0 ? lessonTargets[currentLessonIndex - 1] : null;
  const nextLessonTarget =
    currentLessonIndex >= 0 && currentLessonIndex < lessonTargets.length - 1
      ? lessonTargets[currentLessonIndex + 1]
      : null;
  const selectedSetLabel = useMemo(() => {
    if (!Number.isFinite(selectedSet)) {
      return 'Choose a set';
    }
    const setTitle = setTitles[selectedSet];
    return setTitle || `Set ${selectedSet}`;
  }, [selectedSet, setTitles]);

  if (!config) return null;

  if (config.message) {
    return <GradeComingSoon title={config.title} message={config.message} onBack={backHandler} />;
  }

  if (hasSelectedLesson) {
    return (
      <GradeLessonContent
        gradeTitle={config.title}
        grade={config.grade}
        profile={profile}
        setNumber={effectiveSetNumber}
        lessonNumber={normalizedLessonNumber}
        showSetInTitle={availableSets.length > 0}
        getLessonContent={config.getLessonContent}
        fallbackQuote={config.fallbackQuote}
        onBack={backHandler}
        hasPreviousLesson={Boolean(previousLessonTarget)}
        hasNextLesson={Boolean(nextLessonTarget)}
        onGoPreviousLesson={
          previousLessonTarget
            ? () => onSelectLesson?.(previousLessonTarget.setNumber, previousLessonTarget.lessonNumber)
            : undefined
        }
        onGoNextLesson={
          nextLessonTarget
            ? () => onSelectLesson?.(nextLessonTarget.setNumber, nextLessonTarget.lessonNumber)
            : undefined
        }
        onComplete={(resolvedSetNumber, resolvedLessonNumber, completionPayload, meta) => {
          if (gradeKey === '1') {
            onComplete?.(null, resolvedLessonNumber, completionPayload, {
              grade: 1,
              setNumber: resolvedLessonNumber,
            });
            return;
          }
          onComplete?.(resolvedSetNumber, resolvedLessonNumber, completionPayload, meta);
        }}
        onPractice={onPractice}
        onPlayGame={onPlayGame}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TopNav
        title={config.title}
        onBack={backHandler}
        containerStyle={styles.header}
        backAccessibilityLabel="Back to library"
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {hasSets ? (
          <GradeSelectionSection
            title="Set"
            helperText={selectedSetLabel}
            helperPosition="bottom"
            helperEmphasis
            iconName="book-outline"
            joined
            values={availableSets}
            selectedValue={selectedSet}
            onSelect={setSelectedSet}
          />
        ) : null}
        <GradeSelectionSection
          title="Lesson"
          helperText={
            hasSets && Number.isFinite(selectedSet)
              ? `Choose a lesson in Set ${selectedSet}`
              : 'Choose a lesson'
          }
          iconName="document-text-outline"
          values={availableLessons}
          selectedValue={null}
          disabled={hasSets && !Number.isFinite(selectedSet)}
          onSelect={selectedLessonNumber => onSelectLesson?.(hasSets ? selectedSet : null, selectedLessonNumber)}
        />
      </ScrollView>
    </View>
  );
};

export default GradeScreen;

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
    marginBottom: 8,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHelper: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
  },
  sectionHelperEmphasis: {
    marginTop: 12,
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  joinedOptionGrid: {
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  optionTile: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  joinedOptionTile: {
    flex: 1,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  joinedOptionTileShared: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
  },
  joinedOptionTileSelected: {
    borderColor: 'transparent',
  },
  joinedOptionTileLast: {
    borderRightWidth: 0,
  },
  optionTileThree: {
    width: '31%',
  },
  optionTileFour: {
    width: '23.5%',
  },
  optionTileSelected: {
    backgroundColor: themeVariables.whiteColor,
    borderColor: themeVariables.whiteColor,
  },
  optionTileDisabled: {
    opacity: 0.35,
  },
  optionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
  },
  joinedOptionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionNumber: {
    color: themeVariables.whiteColor,
    fontSize: 18,
    fontWeight: '800',
  },
  optionNumberSelected: {
    color: themeVariables.primaryColor,
  },
});
