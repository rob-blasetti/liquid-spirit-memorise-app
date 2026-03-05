import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import themeVariables from '../../ui/stylesheets/theme';
import { grade1Lessons } from '../../utils/data/core/grade1';
import { GRADE_CARD_DATA } from '../../utils/data/core/gradesConfig';
import { GRADE_SCREEN_CONFIG } from '../../utils/data/core/gradesConfig';
import TopNav from '../../ui/components/TopNav';
import {
  getLibraryContinueCardHidden,
  setLibraryContinueCardHidden,
} from '../../services/libraryContinueCardService';

const HORIZONTAL_PADDING = 16;
const LibraryScreen = ({
  onGradeSelect,
  onBack,
  comingSoonGrades = [],
  onComingSoonGrade,
  grade,
  profileId,
  currentProgress,
  completedLessons = {},
  onContinue,
}) => {
  const [continueVisible, setContinueVisible] = useState(false);
  const [continueHydrated, setContinueHydrated] = useState(false);
  const gradeKey = String(grade || '');
  const canContinue = typeof onContinue === 'function' && ['1', '2', '2b'].includes(gradeKey);
  const showContinueCard = canContinue && continueHydrated && continueVisible;
  const setNumber = Number(currentProgress?.setNumber);
  const lessonNumber = Number(currentProgress?.lessonNumber);
  const activeNumericGrade = Number(gradeKey);
  const progressLabel = (() => {
    if (gradeKey === '1') {
      return `Grade 1 - Lesson ${Number.isFinite(lessonNumber) ? lessonNumber : 1}`;
    }
    if (gradeKey === '2') {
      return `Grade 2 - Set ${Number.isFinite(setNumber) ? setNumber : 1}, Lesson ${
        Number.isFinite(lessonNumber) ? lessonNumber : 1
      }`;
    }
    if (gradeKey === '2b') {
      return `Grade 2b - Set ${Number.isFinite(setNumber) ? setNumber : 4}, Lesson ${
        Number.isFinite(lessonNumber) ? lessonNumber : 1
      }`;
    }
    return null;
  })();
  const getCardProgressLabel = (cardGrade) => {
    if (cardGrade === 1) {
      const nextLesson =
        activeNumericGrade === 1 && Number.isFinite(lessonNumber) ? lessonNumber : 1;
      return `${activeNumericGrade === 1 ? 'Next' : 'Start'}: Lesson ${nextLesson}`;
    }
    if (cardGrade === 2) {
      if (gradeKey === '2b') {
        const nextSet = Number.isFinite(setNumber) ? setNumber : 4;
        const nextLesson = Number.isFinite(lessonNumber) ? lessonNumber : 1;
        return `Next: Set ${nextSet}, Lesson ${nextLesson}`;
      }
      if (activeNumericGrade === 2) {
        const nextSet = Number.isFinite(setNumber) ? setNumber : 1;
        const nextLesson = Number.isFinite(lessonNumber) ? lessonNumber : 1;
        return `Next: Set ${nextSet}, Lesson ${nextLesson}`;
      }
      return 'Start: Set 1, Lesson 1';
    }
    return null;
  };
  const getCompletionStats = (cardGrade) => {
    if (cardGrade === 1) {
      const total = grade1Lessons.length;
      const grade1Map =
        completedLessons && typeof completedLessons === 'object'
          ? completedLessons.grade1 || {}
          : {};
      const completed = Object.values(grade1Map).filter(Boolean).length;
      return { completed, total };
    }
    if (cardGrade === 2) {
      const config = gradeKey === '2b' ? GRADE_SCREEN_CONFIG['2b'] : GRADE_SCREEN_CONFIG[2];
      const sets = Array.isArray(config?.sets) ? config.sets : [];
      const lessons = Array.isArray(config?.lessonNumbers) ? config.lessonNumbers : [];
      const total = sets.length * lessons.length;
      let completed = 0;
      sets.forEach((setNo) => {
        const setMap =
          completedLessons && typeof completedLessons === 'object'
            ? completedLessons[setNo] || {}
            : {};
        lessons.forEach((lessonNo) => {
          if (setMap?.[lessonNo]) {
            completed += 1;
          }
        });
      });
      return { completed, total };
    }
    return { completed: 0, total: 0 };
  };

  useEffect(() => {
    let mounted = true;
    setContinueHydrated(false);

    if (!canContinue) {
      setContinueVisible(false);
      setContinueHydrated(true);
      return () => {
        mounted = false;
      };
    }

    const hydratePreference = async () => {
      try {
        const hidden = await getLibraryContinueCardHidden(profileId);
        if (!mounted) return;
        setContinueVisible(!hidden);
      } catch {
        if (!mounted) return;
        setContinueVisible(true);
      } finally {
        if (mounted) {
          setContinueHydrated(true);
        }
      }
    };

    hydratePreference();
    return () => {
      mounted = false;
    };
  }, [canContinue, profileId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TopNav title="Library" onBack={onBack} containerStyle={styles.header} />

      {/* Grade Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GRADE_CARD_DATA.map((item) => {
          const range = item.ages.split(' ')[1] || item.ages;
          const isComingSoon = comingSoonGrades.includes(item.grade);
          const cardProgressLabel = getCardProgressLabel(item.grade);
          const { completed, total } = getCompletionStats(item.grade);
          const ratio = total > 0 ? Math.min(Math.max(completed / total, 0), 1) : 0;
          const completionLabel = !isComingSoon && total > 0 ? `${completed}/${total} complete` : null;

          const handlePress = () => {
            if (isComingSoon) {
              if (typeof onComingSoonGrade === 'function') {
                onComingSoonGrade(item.grade);
              }
              return;
            }
            if (typeof onGradeSelect === 'function') {
              onGradeSelect(item.grade, item.setNumber);
            }
          };

          return (
            <TouchableOpacity
              key={item.grade}
              style={[
                styles.tile,
                isComingSoon && styles.tileDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handlePress}
              accessibilityLabel={isComingSoon ? `${item.title} coming soon` : `Open ${item.title}`}
            >
              <View style={styles.tileContent}>
                <View style={styles.left}>
                  <View style={styles.titleRow}>
                    <Text style={styles.gradeText}>{item.title}</Text>
                    {isComingSoon ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>Coming Soon</Text>
                      </View>
                    ) : null}
                  </View>
                  {!isComingSoon && cardProgressLabel ? (
                    <Text style={styles.progressHintText}>{cardProgressLabel}</Text>
                  ) : null}
                  {completionLabel ? (
                    <Text style={styles.completionText}>{completionLabel}</Text>
                  ) : null}
                </View>
                <View style={styles.right}>
                  <Text style={styles.ageLabel}>age</Text>
                  <Text style={styles.ageValue}>{range}</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(ratio * 100)}%` }
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {showContinueCard ? (
        <View style={styles.continueDock}>
          <TouchableOpacity
            style={styles.continueTile}
            activeOpacity={0.78}
            onPress={onContinue}
            accessibilityLabel="Continue where you left off"
          >
            <TouchableOpacity
              style={styles.continueCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Dismiss continue card"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              onPress={(event) => {
                if (typeof event?.stopPropagation === 'function') {
                  event.stopPropagation();
                }
                setContinueVisible(false);
                setLibraryContinueCardHidden(profileId, true).catch(() => {});
              }}
            >
              <Ionicons name="close" size={18} color={themeVariables.blackColor} />
            </TouchableOpacity>
            <Text style={styles.continueTitle}>Continue Where You Left Off</Text>
            {progressLabel ? (
              <Text style={styles.continueSubtitle}>{progressLabel}</Text>
            ) : null}
            <Text style={styles.continueAction}>Open Lesson</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  continueDock: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: themeVariables.whiteColor,
  },
  continueTile: {
    backgroundColor: themeVariables.secondaryColor,
    borderRadius: themeVariables.borderRadiusPill,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  continueCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueTitle: {
    color: themeVariables.blackColor,
    fontSize: 20,
    fontWeight: '700',
    paddingRight: 30,
  },
  continueSubtitle: {
    color: themeVariables.blackColor,
    fontSize: 15,
    marginTop: 6,
  },
  continueAction: {
    color: themeVariables.blackColor,
    fontSize: 13,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    opacity: 0.95,
  },
  tile: {
    backgroundColor: themeVariables.tertiaryDarkColor,
    borderRadius: themeVariables.borderRadiusPill,
    marginBottom: 16,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tileDisabled: {
    opacity: 0.65,
  },
  tileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
  },
  left: {
    flexShrink: 1,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeText: {
    color: themeVariables.whiteColor,
    fontSize: 20,
    fontWeight: '500',
  },
  progressHintText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 8,
  },
  completionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ageLabel: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ageValue: {
    color: themeVariables.whiteColor,
    fontSize: 32,
    fontWeight: '300',
    marginTop: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: themeVariables.whiteColor,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    color: themeVariables.whiteColor,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
